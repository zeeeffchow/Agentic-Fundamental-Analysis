from financial_data_service import FinancialDataService

def test_service():
    try:
        # Test the service
        data = FinancialDataService.get_company_info("ORCL")
        print("Company Info:", data)
        
        financial_data = FinancialDataService.get_financial_data("ORCL")
        print("Financial Data:", financial_data)
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_service()