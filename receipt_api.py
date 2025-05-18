from fastapi import FastAPI, File, UploadFile, Form, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import shutil
import sqlite3
from tmp1 import upload_and_extract_receipt, save_receipt_to_db
from datetime import datetime

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/receipt/extract")
async def extract_receipt(file: UploadFile = File(...), api_key: str = Form(...)):
    # Save uploaded file to disk
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        # Call your extraction function
        result = upload_and_extract_receipt(temp_path, api_key)
        # Save to DB
        save_receipt_to_db(result)
        return JSONResponse(content=result)
    finally:
        os.remove(temp_path)

@app.get("/")
def root():
    return {"message": "Receipt Extraction API is running."}

@app.get("/api/dashboard/summary")
def dashboard_summary():
    conn = sqlite3.connect('expensewise.db')
    c = conn.cursor()
    # Get current month and year
    now = datetime.now()
    month_start = now.strftime('%Y-%m-01')
    month_end = now.strftime('%Y-%m-%d')
    # Total spent this month
    c.execute("""
        SELECT IFNULL(SUM(amount),0) FROM receipts
        WHERE date >= ? AND date <= ?
    """, (month_start, month_end))
    total_spent = c.fetchone()[0]
    # Potential tax deductibles (sum of amount * deductible/100)
    c.execute("""
        SELECT IFNULL(SUM(amount * (COALESCE(deductible,0)/100.0)),0) FROM receipts
        WHERE date >= ? AND date <= ?
    """, (f"{now.year}-01-01", f"{now.year}-12-31"))
    total_deductible = c.fetchone()[0]
    # Number of reports (for now, count all receipts)
    c.execute("SELECT COUNT(*) FROM receipts")
    num_reports = c.fetchone()[0]
    # Budget alerts (dummy: categories with >$400 spent this month)
    c.execute("""
        SELECT category, SUM(amount) as spent FROM receipts
        WHERE date >= ? AND date <= ?
        GROUP BY category HAVING spent > 400
    """, (month_start, month_end))
    budget_alerts = [dict(category=row[0], spent=row[1]) for row in c.fetchall()]
    conn.close()
    return JSONResponse(content={
        "total_spent": total_spent,
        "total_deductible": total_deductible,
        "num_reports": num_reports,
        "budget_alerts": budget_alerts
    })

@app.get("/api/receipts")
def get_receipts(from_: str = Query(None, alias="from"), to: str = Query(None, alias="to")):
    conn = sqlite3.connect('expensewise.db')
    c = conn.cursor()
    if from_ and to:
        c.execute("""
            SELECT id, vendor, amount, currency, date, category, deductible FROM receipts
            WHERE date >= ? AND date <= ?
        """, (from_, to))
    else:
        now = datetime.now()
        year_start = f"{now.year}-01-01"
        year_end = f"{now.year}-12-31"
        c.execute("""
            SELECT id, vendor, amount, currency, date, category, deductible FROM receipts
            WHERE date >= ? AND date <= ?
        """, (year_start, year_end))
    rows = c.fetchall()
    receipts = [
        dict(
            id=row[0],
            vendor=row[1],
            amount=row[2],
            currency=row[3],
            date=row[4],
            category=row[5],
            deductible=row[6]
        ) for row in rows
    ]
    conn.close()
    return JSONResponse(content=receipts)

@app.post("/api/tax/ai-summary")
def ai_tax_summary(expenses: list = Body(...), profile: dict = Body({})):
    """Call Qwen VL Max to generate a tax summary and compliance check."""
    import dashscope
    import json
    # Compose a prompt for Qwen
    prompt = f"""
    You are a tax assistant for freelancers in {profile.get('country', 'Malaysia')} / {profile.get('business_type', 'Consultant')}.
    Given the following list of expenses (with category, amount, and deductible %), provide:
    1. A summary of total expenses and total deductible amount.
    2. A breakdown by category, highlighting any categories that may exceed typical tax deduction limits for this profile.
    3. Any compliance warnings or suggestions for optimizing deductions.
    4. Output in clear, concise, bullet-pointed English for tax filing.
    Expenses:
    {json.dumps(expenses, indent=2)}
    """
    # Call Qwen VL Max (text only)
    response = dashscope.Generation.call(
        model="qwen-max",
        prompt=prompt,
        api_key=os.environ.get("DASHSCOPE_API_KEY", "sk-5b8d998434524363936311d878c90a4a"),
        top_p=0.7,
        temperature=0.2,
        max_tokens=512
    )
    result = response['output']['text'] if 'output' in response and 'text' in response['output'] else str(response)
    return JSONResponse(content={"summary": result})
