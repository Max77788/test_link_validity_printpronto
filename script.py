from fastapi import FastAPI, Query
import httpx

app = FastAPI()

@app.get("/check_link")
async def check_link(link: str = Query(..., description="Link to validate")):
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(link)
            
            print(response.text)
            
            # print(response.url)
            
            # If status is 200–399, treat as valid
            if 200 <= response.status_code < 400 and len(response.text) > 0:
                return {"is_link_valid": True}
            else:
                return {"is_link_valid": False}
    except Exception:
        return {"is_link_valid": False}
