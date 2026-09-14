import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


def main():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,1200")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options,
    )

    try:
        print("Opening employee login page...")
        driver.get("http://localhost:3000/employee/login")

        wait = WebDriverWait(driver, 20)
        wait.until(EC.visibility_of_element_located((By.ID, "emp-id")))
        wait.until(EC.visibility_of_element_located((By.ID, "emp-password")))
        wait.until(EC.visibility_of_element_located((By.ID, "employee-signin-btn")))

        heading = driver.find_element(By.XPATH, "//h1[contains(., 'BankPortal Sign In')]")
        assert heading.is_displayed(), "Employee login heading was not visible"

        print("Login form loaded successfully.")

        driver.find_element(By.ID, "emp-id").clear()
        driver.find_element(By.ID, "emp-id").send_keys("EMP005")
        driver.find_element(By.ID, "emp-password").clear()
        driver.find_element(By.ID, "emp-password").send_keys("Admin@1234")
        driver.find_element(By.ID, "employee-signin-btn").click()

        wait.until(EC.url_contains("/employee/mfa"))

        print("Login flow passed: redirected to MFA.")
        print("Current URL:", driver.current_url)

        driver.save_screenshot("frontend_employee_login_test.png")
        print("Screenshot saved as frontend_employee_login_test.png")

        time.sleep(2)

    except Exception as exc:
        print(f"Frontend validation failed: {exc}")
        try:
            driver.save_screenshot("frontend_employee_login_failure.png")
            print("Failure screenshot saved as frontend_employee_login_failure.png")
        except Exception:
            pass
        raise

    finally:
        driver.quit()
        print("Browser closed.")


if __name__ == "__main__":
    main()
