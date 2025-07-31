import os
from dotenv import load_dotenv

def test_imports():
    """Test if all imports work correctly."""
    print("🧪 Testing imports...")
    
    try:
        import openai
        print("✅ OpenAI imported successfully")
    except ImportError as e:
        print(f"❌ OpenAI import failed: {e}")
        return False
    
    try:
        import instructor
        print("✅ Instructor imported successfully")
    except ImportError as e:
        print(f"❌ Instructor import failed: {e}")
        return False
    
    try:
        from atomic_agents.agents.base_agent import BaseAgent
        print("✅ Atomic Agents imported successfully")
    except ImportError as e:
        print(f"❌ Atomic Agents import failed: {e}")
        return False
    
    try:
        from agents.orchestrator import AnalysisOrchestrator
        print("✅ Orchestrator imported successfully")
    except ImportError as e:
        print(f"❌ Orchestrator import failed: {e}")
        print("💡 Make sure you have agents/__init__.py file")
        return False
    
    return True

def test_env_setup():
    """Test if environment variables are set up correctly."""
    print("\n🔑 Testing environment setup...")
    
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        print("❌ OPENAI_API_KEY not found in .env file")
        print("💡 Create .env file with: OPENAI_API_KEY=your_key_here")
        return False
    
    if api_key.startswith("sk-"):
        print("✅ OpenAI API key found and looks correct")
        return True
    else:
        print("❌ OpenAI API key doesn't look correct (should start with 'sk-')")
        return False

def test_client_creation():
    """Test if OpenAI client can be created."""
    print("\n🤖 Testing OpenAI client creation...")
    
    try:
        import openai
        import instructor
        load_dotenv()
        
        client = instructor.from_openai(
            openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        )
        print("✅ OpenAI client created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create OpenAI client: {e}")
        return False

def test_orchestrator_creation():
    """Test if orchestrator can be created."""
    print("\n🎭 Testing orchestrator creation...")
    
    try:
        import openai
        import instructor
        from agents.orchestrator import AnalysisOrchestrator
        load_dotenv()
        
        client = instructor.from_openai(
            openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        )
        
        orchestrator = AnalysisOrchestrator(client)
        print("✅ Orchestrator created successfully")
        print(f"✅ Found {len([attr for attr in dir(orchestrator) if attr.endswith('_agent')])} agents")
        return True
    except Exception as e:
        print(f"❌ Failed to create orchestrator: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Running setup tests...\n")
    
    tests = [
        test_imports,
        test_env_setup,
        test_client_creation,
        test_orchestrator_creation
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
        print()  # Add spacing between tests
    
    print(f"📊 Test Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 All tests passed! Ready to run full analysis.")
        print("💡 Next step: Run 'python main.py' to test with a real company")
    else:
        print("⚠️  Some tests failed. Please fix the issues above before proceeding.")

if __name__ == "__main__":
    main()