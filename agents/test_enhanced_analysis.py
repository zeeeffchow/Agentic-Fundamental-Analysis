# agents/test_enhanced_analysis.py - FIXED VERSION
import asyncio
import instructor
import openai
import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Add the project root to Python path so we can import from agents/
project_root = os.path.dirname(os.path.dirname(__file__))  # Go up one level from agents/
sys.path.append(project_root)

from agents.orchestrator import AnalysisOrchestrator

async def test_enhanced_analysis():
    """Test the enhanced orchestrator with a sample ticker."""
    
    # Initialize OpenAI client - REPLACE WITH YOUR API KEY
    api_key = os.getenv("OPENAI_API_KEY")  # Get from environment variable
    if not api_key:
        print("❌ Please set OPENAI_API_KEY environment variable")
        return
    
    client = instructor.from_openai(openai.OpenAI(api_key=api_key))
    orchestrator = AnalysisOrchestrator(client)
    
    print("🔍 Starting enhanced analysis test...")
    print("=" * 50)
    
    try:
        # Test with a well-known stock
        ticker = "AAPL"
        print(f"Testing enhanced analysis for {ticker}...")
        
        result = await orchestrator.run_full_analysis(ticker)
        
        print("\n✅ Analysis completed successfully!")
        print("=" * 50)
        
        # Check basic structure
        print(f"Analysis Type: {result.get('analysis_type')}")
        print(f"Ticker: {result.get('ticker')}")
        print(f"Timestamp: {result.get('timestamp')}")
        
        # Check if enhanced financial data is present
        if "financial_data" in result and result["financial_data"]:
            print("\n📊 Enhanced Financial Data Found:")
            fin_data = result["financial_data"]
            print(f"  Revenue: ${fin_data.get('revenue', 'N/A')}M")
            print(f"  Revenue Growth 3Y: {fin_data.get('revenue_growth_3y', 'N/A')}%")
            print(f"  Gross Margin: {fin_data.get('gross_margin', 'N/A')}%")
            print(f"  FCF Margin: {fin_data.get('fcf_margin', 'N/A')}%")
            print(f"  Quarterly Revenue Trend: {fin_data.get('quarterly_revenue_trend', 'N/A')}")
        else:
            print("⚠️  No enhanced financial data found")
        
        # Check enhanced business analysis
        if "business_analysis" in result and result["business_analysis"]:
            print("\n🏢 Enhanced Business Analysis Found:")
            biz_data = result["business_analysis"]
            print(f"  Moat Strength: {biz_data.get('moat_strength', 'N/A')}")
            print(f"  Market Share: {biz_data.get('market_share', 'N/A')}%")
            print(f"  Brand Strength: {biz_data.get('brand_strength', 'N/A')}/10")
            
            # Show competitive advantages
            comp_adv = biz_data.get('competitive_advantages', [])
            if comp_adv and len(comp_adv) > 0 and isinstance(comp_adv[0], dict):
                print(f"  Top Competitive Advantage: {comp_adv[0].get('advantage', 'N/A')}")
            else:
                print(f"  Competitive Advantages: {comp_adv[:2] if isinstance(comp_adv, list) else 'N/A'}")
        else:
            print("⚠️  No enhanced business analysis found")
        
        # Check enhanced final recommendation
        if "final_recommendation" in result and result["final_recommendation"]:
            print("\n⚖️ Enhanced Investment Recommendation Found:")
            final_rec = result["final_recommendation"]
            print(f"  Recommendation: {final_rec.get('recommendation', 'N/A')}")
            print(f"  Conviction Level: {final_rec.get('conviction_level', 'N/A')}")
            print(f"  Target Price: ${final_rec.get('target_price', 'N/A')}")
            print(f"  Overall Score: {final_rec.get('overall_score', 'N/A')}/10")
            
            # Show investment thesis preview
            thesis = final_rec.get('investment_thesis', '')
            if thesis:
                print(f"  Investment Thesis Preview: {thesis[:150]}...")
            
            # Show price target range
            price_range = final_rec.get('price_target_range', {})
            if price_range:
                print(f"  Price Targets - Bull: ${price_range.get('bull', 'N/A')}, Base: ${price_range.get('base', 'N/A')}, Bear: ${price_range.get('bear', 'N/A')}")
            
            # Show catalysts
            catalysts = final_rec.get('catalysts', [])
            if catalysts and len(catalysts) > 0:
                print(f"  Key Catalyst: {catalysts[0].get('catalyst', 'N/A') if isinstance(catalysts[0], dict) else catalysts[0]}")
        else:
            print("⚠️  No enhanced final recommendation found")
        
        # Check valuation data
        if "valuation_metrics" in result and result["valuation_metrics"]:
            print("\n💰 Enhanced Valuation Analysis Found:")
            val_data = result["valuation_metrics"]
            print(f"  Current Price: ${val_data.get('current_price', 'N/A')}")
            print(f"  Fair Value Estimate: ${val_data.get('fair_value_estimate', 'N/A')}")
            print(f"  Upside/Downside: {val_data.get('upside_downside', 'N/A')}%")
            print(f"  Valuation Conclusion: {val_data.get('valuation_conclusion', 'N/A')}")
        else:
            print("⚠️  No enhanced valuation data found")
        
        # Check management analysis
        if "management_analysis" in result and result["management_analysis"]:
            print("\n👔 Enhanced Management Analysis Found:")
            mgmt_data = result["management_analysis"]
            print(f"  CEO: {mgmt_data.get('ceo_name', 'N/A')}")
            print(f"  Management Quality: {mgmt_data.get('management_quality', 'N/A')}/10")
            print(f"  Corporate Governance: {mgmt_data.get('corporate_governance', 'N/A')}/10")
        else:
            print("⚠️  No enhanced management analysis found")
        
        # Summary
        print("\n" + "=" * 50)
        print("🎉 TEST RESULTS SUMMARY:")
        
        components_found = []
        if result.get("financial_data"): components_found.append("Financial Data")
        if result.get("business_analysis"): components_found.append("Business Analysis") 
        if result.get("final_recommendation"): components_found.append("Investment Recommendation")
        if result.get("valuation_metrics"): components_found.append("Valuation Analysis")
        if result.get("management_analysis"): components_found.append("Management Analysis")
        if result.get("industry_analysis"): components_found.append("Industry Analysis")
        if result.get("risk_assessment"): components_found.append("Risk Assessment")
        
        print(f"✅ Enhanced components found: {len(components_found)}/7")
        print(f"📋 Components: {', '.join(components_found)}")
        
        if len(components_found) >= 5:
            print("🎯 SUCCESS: Enhanced orchestrator is working correctly!")
        else:
            print("⚠️  WARNING: Some enhanced components are missing")
        
        # Data size comparison
        import json
        data_size = len(json.dumps(result))
        print(f"📊 Total analysis data size: {data_size:,} characters")
        if data_size > 10000:
            print("✅ Data size indicates detailed analysis (good!)")
        else:
            print("⚠️  Data size seems small - may not be fully enhanced")
            
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        print("\nDebugging info:")
        print(f"  Current directory: {os.getcwd()}")
        print(f"  Project root: {project_root}")
        print(f"  Python path: {sys.path[:3]}...")  # Show first 3 entries
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🧪 Enhanced Analysis Orchestrator Test")
    print("=" * 50)
    asyncio.run(test_enhanced_analysis())