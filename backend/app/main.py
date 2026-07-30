from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from app.config import get_settings
from app.database import engine, Base
from app.models.user import User
from app.models.script import GeneratedScript
from app.models.prompt import PromptTemplate
from app.models.template import ScriptTemplate
from app.models.api_key import ApiKey
from app.models.audit_log import AuditLog
from app.routers import auth, users, scripts, prompts, templates, settings as settings_router, admin
from app.middleware.rate_limiter import RateLimiterMiddleware

config = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_system_data()
    yield


app = FastAPI(
    title="AI Automation Script Generator",
    description="Generate automation test scripts using LLMs",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(RateLimiterMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.resolved_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def seed_system_data():
    from sqlalchemy import select, func
    from app.database import async_session_factory
    from app.models.prompt import PromptTemplate
    from app.models.template import ScriptTemplate
    import json
    from pathlib import Path

    async with async_session_factory() as db:
        count = (await db.execute(select(func.count(PromptTemplate.id)).where(PromptTemplate.is_system == True))).scalar()
        if count == 0:
            prompts = [
                PromptTemplate(title="Login Test", description="Comprehensive login automation test suite covering valid/invalid credentials, locked accounts, session handling, and accessibility with Playwright TypeScript", category="login", prompt_content="""Role: You are a Senior QA Automation Architect specializing in authentication testing using Playwright and TypeScript.

Instructions:
1. Generate a complete Page Object Model for a LoginPage with locators for email, password, login button, error messages, and forgot-password link.
2. Write test cases in a single Playwright spec file (login.spec.ts) using test.describe('Login Functionality').
3. Each test must be independent with its own beforeEach setup that navigates to the login page.
4. Include explicit assertions using expect with descriptive failure messages.
5. Use data-testid attributes for all selectors and avoid brittle CSS/XPath selectors.
6. Structure the spec with clear TC-IDs: TC_LOGIN_001 through TC_LOGIN_009.

Context:
The application under test is a modern SPA (React/Angular) with JWT-based authentication. Users authenticate at /login with an email and password. The backend returns a JWT access token (15 min expiry) and refresh token (7 day expiry). After 5 failed attempts, the account locks for 15 minutes. The site supports WCAG 2.1 AA compliance. Sessions persist across tabs via localStorage.

Examples of expected test structure:
- TC_LOGIN_001: Valid login with registered credentials → verify redirect to /dashboard, welcome message visible, access token stored in localStorage.
- TC_LOGIN_002: Invalid password → verify error toast "Invalid email or password", input borders turn red, URL stays on /login.
- TC_LOGIN_003: Empty fields submission → verify client-side validation errors for both fields, login button remains disabled until both fields filled.
- TC_LOGIN_004: Non-existent user email → verify same generic error as invalid password (security best practice — don't reveal whether email exists).
- TC_LOGIN_005: SQL Injection attempt in email field → verify input is sanitized, no error page, app rejects special characters gracefully.
- TC_LOGIN_006: XSS attempt in email field → verify script tags are escaped, no alert dialog fires.
- TC_LOGIN_007: Account lockout after 5 failed attempts → loop 5 invalid logins, verify lockout message "Account temporarily locked. Try again in 15 minutes", attempt valid login and confirm still locked.
- TC_LOGIN_008: Remember Me checkbox → login with "Remember Me" checked, close and reopen browser tab, verify user is still authenticated, verify tokens persisted.
- TC_LOGIN_009: Tab key navigation order through login form (accessibility) → verify focus moves Email → Password → Remember Me → Forgot Password → Login Button in correct tabindex order.

Parameters:
- Framework: Playwright with TypeScript
- Base URL: process.env.BASE_URL (default http://localhost:3000)
- Test user credentials from environment variables or a test-config fixture
- Viewport: 1280x720 for desktop, 375x812 for mobile responsive tests

Output format:
Generate the complete TypeScript file with imports, Page Object class, and all test cases. Include a test-data fixture at the top. Add a README comment block at the top explaining how to run the suite. Use proper TypeScript types for all parameters and return values.

Tone: Professional, precise, and security-conscious. Emphasize OWASP testing best practices. Avoid flaky patterns like arbitrary waitForTimeout — use proper waitForSelector/waitForResponse instead.""", is_system=True),
                PromptTemplate(title="Registration", description="End-to-end user registration flow test suite with form validation, email verification, password policies, and edge case handling using Playwright TypeScript", category="registration", prompt_content="""Role: You are a Senior QA Automation Engineer expert in user onboarding and registration flows. You specialize in Playwright TypeScript and comprehensive form validation testing.

Instructions:
1. Generate a RegistrationPage POM with locators for all registration fields: first name, last name, email, phone, password, confirm password, terms checkbox, newsletter opt-in, and submit button.
2. Write a Playwright spec (registration.spec.ts) with test.describe('User Registration') covering positive and negative scenarios.
3. Each test must be atomic — register a fresh user (use unique email via timestamp/UUID) and clean up if needed.
4. Use data-testid attributes for all selectors.
5. Include visual regression checks for the registration form layout using Playwright screenshots.
6. Structure with TC_REGI_001 through TC_REGI_012.

Context:
The application has a multi-step registration form (Step 1: Account Details, Step 2: Personal Info, Step 3: Verify Email). Password policy requires minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character. Email is unique — system checks availability via API on blur. Phone format validated client-side for +XX-XXXXXXXXXX pattern. Terms acceptance is mandatory. Email verification sends a 6-digit OTP valid for 10 minutes. After verification, user lands on onboarding wizard.

Examples of expected test cases:
- TC_REGI_001: Successful registration with valid unique data → fill all fields correctly, submit, verify success toast "Account created! Check your email for verification code", redirect to OTP entry page.
- TC_REGI_002: Password too short (7 chars) → verify inline error "Password must be at least 8 characters", submit button remains disabled until fixed.
- TC_REGI_003: Password missing uppercase → verify error "Password must include at least one uppercase letter".
- TC_REGI_004: Password missing special character → verify error "Password must include at least one special character".
- TC_REGI_005: Passwords don't match → type different passwords in confirm field, verify error "Passwords do not match", form cannot submit.
- TC_REGI_006: Already registered email → enter existing email, verify API blur check returns "This email is already registered. Please log in.", login link appears.
- TC_REGI_007: Invalid email format (no @ sign) → verify HTML5/inline validation triggers "Please enter a valid email address".
- TC_REGI_008: Invalid phone format → enter "12345", verify error "Phone must be in +XX-XXXXXXXXXX format".
- TC_REGI_009: Terms not accepted → fill all fields correctly but leave terms unchecked, click submit, verify checkbox border highlights red with "You must accept the Terms and Conditions".
- TC_REGI_010: Form clear/reset → fill all fields, click reset, verify all fields are cleared, submit button is disabled, no error messages remain.
- TC_REGI_011: Successful registration + email verification with OTP → complete registration, enter valid OTP "123456", verify redirect to onboarding wizard with welcome step.
- TC_REGI_012: Expired OTP → complete registration, wait 10+ minutes (mock timer), enter OTP, verify "OTP has expired. Click Resend to get a new code" message.

Parameters:
- Framework: Playwright TypeScript
- Base URL from environment variable
- Unique email generation: testuser+${Date.now()}@example.com
- Browser: Chromium, headless for CI

Output format:
Full TypeScript spec file with POM class, test fixtures, and all test cases. Include a constants file for password policy rules. Add beforeEach that seeds database or ensures clean state via API teardown.

Tone: User-experience focused. Test from the perspective of a real user filling the form. Highlight accessibility considerations for form labels and error announcements.""", is_system=True),
                PromptTemplate(title="Checkout", description="Complete e-commerce checkout flow test suite covering guest checkout, address validation, shipping methods, promo codes, order summary verification, and payment integration with Playwright TypeScript", category="checkout", prompt_content="""Role: You are a Senior E-Commerce QA Architect with deep expertise in checkout funnel testing. You know every edge case that causes cart abandonment and revenue loss.

Instructions:
1. Create a full checkout suite (checkout.spec.ts) with POM classes for CartPage, CheckoutPage, ShippingPage, PaymentPage, and OrderConfirmationPage.
2. Test both guest checkout and logged-in user checkout flows.
3. Include tests for address autocomplete, shipping method selection, promo code application, tax calculation, and order summary accuracy.
4. Use network interception (page.route) to mock payment gateway responses for success/failure/3D-Secure scenarios.
5. Each test should verify the order confirmation page shows correct order number, items, total, and estimated delivery date.
6. Structure with TC_CHECKOUT_001 through TC_CHECKOUT_015.

Context:
The e-commerce platform supports guest checkout and authenticated checkout. Shipping calculated based on address, weight, and selected method (Standard 5-7 days, Express 2-3 days, Overnight). Promo codes can be percentage-based or fixed-amount with minimum order thresholds. Tax calculated by destination ZIP code. Payment via Stripe Elements with 3D Secure for amounts over $500. Order confirmation sends email and shows order ID. Cart persists across sessions for logged-in users.

Examples of expected test cases:
- TC_CHECKOUT_001: Guest checkout — happy path → add item to cart, proceed to checkout as guest, fill shipping address, select Standard shipping, verify order summary line items and calculated tax, enter test card 4242..., confirm order, verify success page with order ID.
- TC_CHECKOUT_002: Logged-in user checkout with saved address → login, verify saved addresses populate shipping dropdown, select saved address, verify one-click address selection fills all fields, complete order.
- TC_CHECKOUT_003: Invalid promo code → add item, proceed to checkout, enter "INVALID123" promo code, click Apply, verify error toast "Promo code not found", verify subtotal unchanged.
- TC_CHECKOUT_004: Valid percentage promo code → apply "SAVE20" (20% off), verify discount line appears with -$XX.XX, verify new total = subtotal - discount + tax + shipping.
- TC_CHECKOUT_005: Promo code below minimum order → add item under $10, apply "SAVE50" (min $50), verify error "Minimum order of $50.00 required for this promo code".
- TC_CHECKOUT_006: Change shipping method and verify price update → toggle from Standard ($5.99) to Express ($14.99), verify shipping line updates, verify total recalculates.
- TC_CHECKOUT_007: Empty cart checkout attempt → navigate directly to /checkout with empty cart, verify redirect to /cart with message "Your cart is empty".
- TC_CHECKOUT_008: Address validation — missing required field → try to proceed without ZIP code, verify error "ZIP code is required for shipping".
- TC_CHECKOUT_009: International shipping address → enter non-US address, verify "We currently only ship within the United States" message, checkout blocked.
- TC_CHECKOUT_010: Payment declined (mocked) → use card 4000000000000002, verify error "Your card was declined. Please try a different payment method."
- TC_CHECKOUT_011: 3D Secure authentication required → order total exceeds $500, verify 3D Secure iframe appears, complete challenge, verify payment succeeds.
- TC_CHECKOUT_012: Order summary accuracy → add 2 different products at specific prices, verify subtotal matches sum, verify tax calculation (8.5% of subtotal), verify total = subtotal + tax + shipping - discount.
- TC_CHECKOUT_013: Browser back button during checkout → click back on payment page, verify cart state preserved, verify can continue checkout.
- TC_CHECKOUT_014: Session timeout during checkout → idle for session timeout period, verify "Your session has expired. Please log in again." redirect to login, after re-login verify cart restored.
- TC_CHECKOUT_015: Multiple quantities of same item → add item with qty 3, verify line item shows qty 3 and unit price × 3, verify subtotal reflects correct multiplication.

Parameters:
- Framework: Playwright TypeScript
- Base URL from env
- Stripe test card numbers per Stripe documentation
- Mock payment API responses via route interception

Output format:
Full spec file with all POM classes, data fixtures for products/promo codes/addresses, and documented test cases. Include a shared test fixture that seeds the cart with items before checkout tests.

Tone: Revenue-focused and detail-oriented. Frame each test around the business impact — abandoned carts, incorrect charges, and failed payments lose real money. Test like every dollar matters.""", is_system=True),
                PromptTemplate(title="Payment", description="Payment processing test suite for card payments, digital wallets, bank transfers, refunds, and edge cases with mocked payment gateway integration using Playwright TypeScript", category="payment", prompt_content="""Role: You are a FinTech QA Lead responsible for payment gateway testing. Your tests directly prevent financial losses and ensure PCI-DSS compliance.

Instructions:
1. Create payment.spec.ts with POM for PaymentPage and PaymentConfirmationPage.
2. Intercept all real payment API calls using page.route() — never hit real payment gateways in tests.
3. Test multiple payment methods: Credit Card (Visa, Mastercard, Amex), Debit Card, Digital Wallet (Apple Pay, Google Pay), Bank Transfer (ACH), and Buy Now Pay Later (Klarna, Afterpay).
4. Test all Stripe/Adyen error scenarios: declined, insufficient funds, expired card, incorrect CVC, processing error, fraud detected.
5. Include idempotency tests — double-click submit prevention, no duplicate charges.
6. Structure with TC_PAY_001 through TC_PAY_014.

Context:
Payment gateway is Stripe (or Adyen with similar API). PCI-DSS Level 1 compliance required — no raw card data touches app server, all handled via Stripe Elements / Payment Intents. Webhook events trigger order status updates. Refund API supports full and partial refunds within 30 days. Multi-currency support with dynamic conversion rates. Payment methods vary by region (EU requires SEPA, India requires UPI).

Examples of expected test cases:
- TC_PAY_001: Successful credit card payment → fill valid card 4242424242424242, CVC 123, expiry 12/30, submit, verify payment intent status "succeeded", verify order status updated to "Paid", verify success page with transaction reference.
- TC_PAY_002: Card declined — insufficient funds → use card 4000000000009995, verify error "Your card has insufficient funds", verify order status remains "Payment Pending", verify user can retry with different card.
- TC_PAY_003: Card declined — expired card → use card with past expiry date, verify inline error "Card is expired. Please use a valid card." before submission.
- TC_PAY_004: Incorrect CVC → enter wrong CVC 000, verify error "Your card's security code is incorrect.", verify retry countdown or remaining attempts.
- TC_PAY_005: Fraud detected → use card 4100000000000019, verify "Payment declined by card issuer. Please contact your bank.", verify transaction flagged as blocked in test dashboard.
- TC_PAY_006: Card processing error (generic) → mock 500 from payment API, verify user sees "Payment processing error. Please try again. If the issue persists, contact support.", verify no charge created, verify retry button available.
- TC_PAY_007: Double-click payment prevention → click Pay Now, immediately click again, verify button disabled with spinner, verify only one payment intent created.
- TC_PAY_008: Payment timeout → mock slow API (10s+ delay), verify loading spinner visible, verify timeout message "Payment is taking longer than expected. Do not refresh the page.", verify eventual success or graceful timeout.
- TC_PAY_009: ACH bank transfer → select Bank Transfer method, enter routing 110000000 and account 000123456789, verify micro-deposit verification flow, verify transfer submitted message.
- TC_PAY_010: Digital wallet — Apple Pay → mock Apple Pay sheet, verify Apple Pay button visible only on Safari, simulate successful tokenization, verify order completed.
- TC_PAY_011: Full refund → complete payment, navigate to order, request full refund, verify refund status "Refunded", verify amount refunded equals original amount, verify refund transaction ID generated.
- TC_PAY_012: Partial refund → complete payment for $100 order, request partial refund of $30, verify refunded amount shows $30, verify remaining $70 not affected, verify second partial refund for $70 works.
- TC_PAY_013: Refund after 30 days → attempt refund on 31-day-old order, verify "Refund window (30 days) has expired" error.
- TC_PAY_014: Multi-currency payment → switch to EUR, verify prices update, complete payment in EUR, verify confirmation shows EUR symbol, verify no hidden currency conversion fees on confirmation.

Parameters:
- Framework: Playwright TypeScript
- Stripe test card numbers from Stripe testing docs
- Network mocking via page.route("**/api/payment/**", handler)
- environment variables for API keys (test mode only)

Output format:
Complete TypeScript spec with all POM classes, mock response fixtures, and comprehensive test suite. Include a mock server helper that returns realistic payment gateway responses based on card number patterns.

Tone: Financially precise and security-aware. Every test should cite which real-world fraud or user complaint scenario it prevents. Reference PCI-DSS requirements where applicable.""", is_system=True),
                PromptTemplate(title="Search", description="Search functionality test suite covering full-text search, faceted filters, pagination, sorting, autocomplete, empty states, and performance benchmarks using Playwright TypeScript", category="search", prompt_content="""Role: You are a Senior Search QA Specialist. You test search engines like Google or Elasticsearch-based product catalogs. You think like a frustrated user who can't find what they're looking for.

Instructions:
1. Create search.spec.ts with POM for SearchPage, SearchResultsPage, and FilterPanel.
2. Test the full search user journey: type query → get suggestions → select suggestion or submit → view results → apply facets → sort → paginate → select result.
3. Test autocomplete/typeahead with mock API responses covering: no suggestions, partial match, exact match, trending searches.
4. Test all filter combinations: category, price range, rating, brand, availability (in-stock only).
5. Verify sort orders: Relevance, Price Low-to-High, Price High-to-Low, Newest, Rating, Best Selling.
6. Structure with TC_SRCH_001 through TC_SRCH_015.

Context:
Search is powered by Elasticsearch with 50ms typical response time. Autocomplete queries fire at 300ms debounce after 2+ characters typed. Results support faceted filters (categories, price range slider, brand checkboxes, rating stars, availability toggle). Pagination shows 24 results per page with numbered navigation. Empty state shows "No results found" with a "Did you mean?" spellcheck suggestion. Recently viewed items appear in a sidebar. Search analytics track zero-result queries.

Examples of expected test cases:
- TC_SRCH_001: Exact product search → search "iPhone 15 Pro", verify top result is iPhone 15 Pro, verify product name, price, and image loaded, verify result count > 0.
- TC_SRCH_002: Partial keyword search → search "wireless head", verify autocomplete suggests "wireless headphones" and "wireless headset", select "wireless headphones", verify results all contain "headphones".
- TC_SRCH_003: Search with no results → search "xyzabc123nonexistent", verify "No results found for 'xyzabc123nonexistent'" message, verify "Did you mean?" suggestion appears, verify "Browse All Categories" link visible.
- TC_SRCH_004: Autocomplete debounce → rapidly type "c-a-m-e-r-a" character by character with pauses under 300ms, verify only one API call made per debounce window, verify network panel confirms optimized requests.
- TC_SRCH_005: Search with special characters → search "C++ Programming", verify query is URL-encoded, verify results relevant to book category, verify no 500 error from unescaped characters.
- TC_SRCH_006: Category filter → search "jacket", apply category filter "Men > Outerwear", verify all results belong to Men's Outerwear category, verify result count decreases, breadcrumb shows active filter.
- TC_SRCH_007: Price range filter → search "laptop", set price range $500-$1000, verify all result prices between $500 and $1000, verify price slider min/max labels update.
- TC_SRCH_008: Combined filters → search "running shoes", filter Brand: Nike, filter Size: 10, filter Color: Black, filter Price: $80-$150, verify all results match ALL four filter criteria.
- TC_SRCH_009: Sort by price low-to-high → search "monitor", sort by Price: Low to High, verify prices in ascending order, verify first item is cheapest.
- TC_SRCH_010: Sort by rating → search "restaurant", sort by Rating, verify results ordered by star rating descending.
- TC_SRCH_011: Pagination → search broad term "shirt", verify 24 results per page, click page 2, verify URL has ?page=2, verify different results loaded, click Next, verify page 3.
- TC_SRCH_012: Clear all filters → apply 3 filters, click "Clear All", verify all filters reset to default, verify original result count restored.
- TC_SRCH_013: Search with trailing/leading spaces → search "  Samsung TV  ", verify query trimmed to "Samsung TV", verify results match trimmed query.
- TC_SRCH_014: Empty search submission → click search with empty input, verify "Please enter a search term" inline error, verify search button is disabled when input is empty.
- TC_SRCH_015: Recently viewed persistence → search and click a product (adds to recently viewed), return to search, verify recently viewed sidebar shows that product, verify clicking it navigates directly.

Parameters:
- Framework: Playwright TypeScript
- Base URL from env
- Mock search API via page.route for consistent test data
- Debounce timing: 300ms (configurable via constant)

Output format:
Complete TypeScript spec with SearchPage and FilterPanel POM classes, mock search response fixtures for different test scenarios, and all test cases. Include helper to generate deterministic mock results.

Tone: User-centric. Frame tests around real user behavior — people who type fast, misspell, use their own jargon, and want results instantly. Search is the primary navigation for most users; get it wrong and they leave.""", is_system=True),
                PromptTemplate(title="Cart", description="Shopping cart test suite covering add/remove/update items, quantity limits, save-for-later, stock validation, price calculations, cross-device persistence, and edge cases using Playwright TypeScript", category="cart", prompt_content="""Role: You are a Senior E-Commerce QA Engineer who obsesses over cart reliability. You know cart bugs are the #1 cause of checkout abandonment and lost revenue.

Instructions:
1. Create cart.spec.ts with POM for ProductPage, CartPage, and MiniCart (flyout component).
2. Test all CRUD cart operations: add single item, add multiple items, update quantity, remove item, empty cart.
3. Verify cart badge/bubble count updates in real-time across header, mini-cart, and full cart page.
4. Test stock-aware behavior: cannot add more than available stock, stock warning when inventory is low.
5. Test cart persistence: items survive page refresh, browser close/reopen, and tab switches.
6. Structure with TC_CART_001 through TC_CART_016.

Context:
Cart is a client-side state managed via Zustand/Redux with API sync on mutation. Stock is checked on each add-to-cart operation. Mini-cart opens as a slide-out drawer on add. Quantity can be updated inline with +/- buttons or direct input. Save for Later moves item to a separate list. Cart shows: product image, name, variant (size/color), unit price, quantity selector, line total, subtotal, estimated tax, and shipping threshold progress bar ("Add $15.00 more for free shipping").

Examples of expected test cases:
- TC_CART_001: Add single item to empty cart → browse product, click "Add to Cart", verify success toast "Added to cart", verify cart badge shows "1", open mini-cart, verify product name, price, qty 1, and image visible.
- TC_CART_002: Add multiple different products → add 3 distinct products, verify cart badge shows "3", verify mini-cart lists all 3 products, verify line totals for each product.
- TC_CART_003: Add same product twice → add product, add same product again, verify quantity increments to 2 in mini-cart, verify line total = unit price × 2, verify "Item already in cart — quantity updated" toast.
- TC_CART_004: Update quantity with + button → click + on cart item, verify quantity increases by 1, verify subtotal recalculated, verify stock availability checked.
- TC_CART_005: Update quantity with direct input → type "5" in quantity input and press Enter, verify quantity set to 5, verify line total recalculated.
- TC_CART_006: Remove single item → click remove/X on one item, verify item removed from cart, verify cart badge decrements, verify "Item removed" toast, verify other items unaffected.
- TC_CART_007: Empty entire cart → click "Empty Cart" button, verify confirmation dialog "Remove all items?", confirm, verify cart is empty, verify empty state "Your cart is empty" with "Continue Shopping" CTA button.
- TC_CART_008: Attempt to add more than available stock → product has 3 in stock, try to set quantity to 5, verify error "Only 3 available", verify quantity resets to max available (3).
- TC_CART_009: Low stock warning → product has 2 in stock, set quantity to 2, verify warning badge "Only 2 left in stock" appears with urgency styling.
- TC_CART_010: Out of stock product in cart → add product (in stock), mock product going out of stock, refresh cart page, verify "This item is no longer available" overlay, verify item cannot be checked out.
- TC_CART_011: Save for Later → click "Save for Later" on cart item, verify item moves to Saved Items section, verify cart badge decrements, verify Saved Items count increments, verify "Move to Cart" button appears.
- TC_CART_012: Move from Saved to Cart → in Saved Items, click "Move to Cart", verify item returns to active cart, verify Saved Items list shrinks, verify stock re-checked.
- TC_CART_013: Cart totals accuracy → add 3 items at known prices, verify subtotal = sum of all line totals, verify estimated tax = subtotal × tax rate, verify free shipping threshold progress bar shows correct remaining amount.
- TC_CART_014: Cart persistence after page refresh → add 3 items, refresh page (CMD+R / Ctrl+R), verify all 3 items still in cart, verify quantities preserved, verify subtotal unchanged.
- TC_CART_015: Cart across browser tabs → add items in Tab 1, open Tab 2, verify cart syncs within 5 seconds (or on focus), add item in Tab 2, switch to Tab 1, verify cart updated.
- TC_CART_016: Quantity zero and negative edge cases → type "0" in quantity, verify item removed automatically with toast "Item removed (quantity set to 0)", type "-1", verify input rejects negative numbers, minimum value is 1.

Parameters:
- Framework: Playwright TypeScript
- Base URL from env
- Mock stock/inventory API responses
- localStorage/sessionStorage inspection for cart persistence

Output format:
Complete TypeScript spec with POM classes for all cart components (MiniCart, CartPage, ProductPage), mock data fixtures for products with different stock levels, and all 16 test cases thoroughly documented.

Tone: Revenue-protective. Frame every test as a defense against real scenarios where real users abandon real carts. Make the business impact of each potential bug explicit.""", is_system=True),
                PromptTemplate(title="CRUD", description="Full CRUD operations test suite covering Create, Read, Update, Delete with API and UI validation, optimistic updates, error handling, and data integrity checks using Playwright TypeScript", category="crud", prompt_content="""Role: You are a Senior Full-Stack QA Engineer specializing in data integrity testing. You ensure every create, read, update, and delete operation is reliable, consistent, and handles failures gracefully.

Instructions:
1. Create crud.spec.ts testing a resource management interface (e.g., Project Manager, Task Board, or User Admin panel) with POM classes for ListPage, CreatePage, EditPage, and DeleteDialog.
2. Test both optimistic UI patterns and pessimistic (server-first) patterns where applicable.
3. Cover API layer directly using Playwright's request context (APIRequestContext) for backend validation alongside UI tests.
4. Include concurrency and race-condition tests: two users editing same resource, deleting a resource being viewed by another user.
5. Structure with TC_CRUD_001 through TC_CRUD_016.

Context:
The application has a resource management dashboard with list view (table with sortable columns), detail view (single resource), create form (modal or full page), and edit form. Delete requires confirmation dialog. API uses REST with standard status codes. Optimistic updates for toggle actions (like/unlike, archive/restore), pessimistic for create/update/delete. Pagination with 25 items per page. Search across all fields. Soft delete with 30-day trash/recycle bin recovery.

Examples of expected test cases:
- TC_CRUD_001: Create new resource → navigate to Create form, fill all required fields (name, description, category, priority), submit, verify success toast "Resource created successfully", verify redirected to list with new item at top, verify all values persisted correctly via API GET.
- TC_CRUD_002: Create with only required fields → fill only name and required fields, leave optional fields blank, submit, verify resource created, verify optional fields show as "—" or empty in list view.
- TC_CRUD_003: Create validation — empty required field → submit form with empty name field, verify inline error "Name is required", verify form not submitted, verify no API call made.
- TC_CRUD_004: Create validation — max length exceeded → type 256 characters in a field with 255 char limit, verify "Must be 255 characters or fewer" error, verify character counter shows 256/255 with red styling.
- TC_CRUD_005: Read — list view loads with pagination → verify table loads with 25 items, verify column headers sortable, click column to sort ascending, click again for descending, verify sort indicator arrow.
- TC_CRUD_006: Read — search and filter in list → search for "Urgent", verify only matching items shown, verify result count updates, clear search, verify all items restored, verify search is debounced.
- TC_CRUD_007: Read — detail view → click on a resource name, verify detail page/modal loads with all fields, verify edit and delete buttons visible, verify back-to-list navigation works.
- TC_CRUD_008: Update — edit all fields → open edit form, change name, description, category, priority, submit, verify success toast, verify list view reflects all changes, verify API GET confirms new values.
- TC_CRUD_009: Update — edit then cancel → open edit, change several fields, click Cancel, verify changes discarded, verify list view shows original values, verify no API PUT called.
- TC_CRUD_010: Update — optimistic toggle → toggle a boolean field (e.g., Archived), verify UI updates immediately (no loading spinner), verify API call succeeds, verify state persists after refresh, test failure case where API returns 500 → UI reverts to original state with error toast.
- TC_CRUD_011: Update — stale data conflict → User A opens edit, User B edits same resource and saves, User A tries to save → verify conflict warning "This resource was modified by another user. Refresh to see latest changes." with refresh/reload option.
- TC_CRUD_012: Delete — single resource → click delete on list item, verify confirmation dialog "Are you sure you want to delete '{name}'? This action can be undone within 30 days.", confirm, verify item removed from list, verify success toast, verify item appears in Recycle Bin.
- TC_CRUD_013: Delete — cancel confirmation → click delete, click Cancel on dialog, verify item NOT removed, verify list unchanged.
- TC_CRUD_014: Delete — already deleted resource → delete resource, try to navigate to its detail URL, verify 404 page or "This resource has been deleted" message with link to list.
- TC_CRUD_015: Restore from recycle bin → navigate to Trash/Recycle Bin, verify deleted item listed with delete date, click Restore, verify item reappears in main list with all original data intact.
- TC_CRUD_016: Bulk operations → select 3 items via checkboxes, click "Bulk Delete", confirm, verify all 3 removed, verify bulk count badge visible during selection, verify "Select All" checkbox selects/deselects all.

Parameters:
- Framework: Playwright TypeScript with APIRequestContext
- Base URL from env
- Seeded test data with known IDs for deterministic testing
- Mock concurrent-user scenarios using page.route interception

Output format:
Full TypeScript spec file with POM classes for each view, API helper utilities, seed-data fixtures, and all test cases. Include a concurrency helper that simulates multi-user scenarios.

Tone: Data-integrity focused. Every test is framed around preventing real data loss, corruption, or user frustration. CRUD seems simple until it's not — test like data loss costs users.""", is_system=True),
                PromptTemplate(title="API Login", description="API authentication test suite covering JWT token lifecycle, OAuth2 flows, rate limiting, RBAC, token refresh, and security headers validation using Playwright API testing", category="api", prompt_content="""Role: You are a Senior API Security QA Engineer. You build comprehensive API test suites that ensure authentication, authorization, and token management are bulletproof against OWASP API Top 10 threats.

Instructions:
1. Create api-auth.spec.ts using Playwright's request context (APIRequestContext) — no browser needed, pure API testing.
2. Test the complete JWT lifecycle: login → receive access + refresh tokens → use access token for authenticated requests → token expiration → refresh → logout/invalidate.
3. Test OAuth2 authorization code flow with PKCE if applicable.
4. Verify security headers, CORS, rate limiting, and RBAC enforcement on every endpoint.
5. Include negative tests: expired tokens, tampered tokens, missing tokens, wrong-role tokens.
6. Structure with TC_APIAUTH_001 through TC_APIAUTH_018.

Context:
API is RESTful with JSON payloads. Authentication uses JWT (RS256) with access tokens (15 min) and refresh tokens (7 days). Tokens are sent as Bearer token in Authorization header. Refresh endpoint exchanges refresh token for new access token. Logout blacklists the refresh token. Rate limiting: 100 requests/minute per user, 5 login attempts/minute per IP. RBAC roles: Admin, Manager, User, ReadOnly — each with different endpoint access. API versioning via URL prefix /api/v1/. All responses include security headers (X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, Content-Security-Policy).

Examples of expected test cases:
- TC_APIAUTH_001: Successful login → POST /api/auth/login with valid credentials, verify 200 OK, verify response body contains access_token, refresh_token, token_type: "Bearer", expires_in: 900, verify user object with id, email, role.
- TC_APIAUTH_002: Invalid credentials → POST /api/auth/login with wrong password, verify 401 Unauthorized, verify error body {"error": "Invalid email or password", "code": "AUTH_INVALID_CREDENTIALS"}, verify no token returned, verify WWW-Authenticate header present.
- TC_APIAUTH_003: Missing credentials → POST /api/auth/login with empty body, verify 400 Bad Request, verify validation error with field-level messages, verify no authentication attempted.
- TC_APIAUTH_004: Access protected endpoint with valid token → GET /api/v1/users/me with Bearer token, verify 200 OK, verify response contains current user details.
- TC_APIAUTH_005: Access protected endpoint without token → GET /api/v1/users/me without Authorization header, verify 401 Unauthorized, verify error body {"error": "Authentication required", "code": "AUTH_MISSING_TOKEN"}.
- TC_APIAUTH_006: Access protected endpoint with expired token → use access token past 15-min expiry, verify 401 Unauthorized, verify error {"error": "Token expired", "code": "AUTH_TOKEN_EXPIRED"}, verify response suggests using refresh endpoint.
- TC_APIAUTH_007: Token refresh — valid refresh → POST /api/auth/refresh with valid refresh_token, verify 200 OK, verify new access_token and new refresh_token returned (rotation), verify old refresh_token invalidated.
- TC_APIAUTH_008: Token refresh — expired refresh → POST /api/auth/refresh with 8-day-old refresh token, verify 401 Unauthorized, verify error {"error": "Refresh token expired. Please log in again.", "code": "AUTH_REFRESH_EXPIRED"}.
- TC_APIAUTH_009: Token refresh — reused refresh token (replay attack) → refresh token, then try refreshing with the OLD refresh token again, verify 401, verify error about token reuse detected, verify all tokens for user invalidated (security — theft detected).
- TC_APIAUTH_010: Tampered JWT → send request with modified payload (change role from "User" to "Admin"), verify 401 Unauthorized, verify error about invalid signature, verify no data leakage.
- TC_APIAUTH_011: Logout — invalidate tokens → POST /api/auth/logout with refresh_token, verify 200 OK, try to use the old access token, verify 401, try to refresh, verify 401 (both tokens invalidated).
- TC_APIAUTH_012: RBAC — Admin-only endpoint accessed by User → GET /api/v1/admin/users with User-role token, verify 403 Forbidden, verify error {"error": "Insufficient permissions", "code": "RBAC_FORBIDDEN"}, verify no user data leaked in error response.
- TC_APIAUTH_013: RBAC — ReadOnly role cannot modify → POST /api/v1/data with ReadOnly token, verify 403 Forbidden, verify ReadOnly can still GET same endpoint successfully.
- TC_APIAUTH_014: Rate limiting — login endpoint → send 6 login requests within 5 seconds from same IP, verify 5th succeeds, verify 6th returns 429 Too Many Requests, verify Retry-After header present with seconds value.
- TC_APIAUTH_015: Rate limiting — general API → send 101 requests within 1 minute with valid token, verify 100th succeeds, verify 101st returns 429, verify Retry-After header, wait for reset, verify 102nd succeeds.
- TC_APIAUTH_016: Security headers on authenticated response → GET any endpoint, verify X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Strict-Transport-Security: max-age=31536000; includeSubDomains, X-XSS-Protection: 0, Referrer-Policy: strict-origin-when-cross-origin.
- TC_APIAUTH_017: CORS preflight → OPTIONS /api/auth/login with Origin header, verify 204 No Content, verify Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers headers present and correct.
- TC_APIAUTH_018: SQL Injection in login → POST /api/auth/login with email "admin@test.com' OR '1'='1", verify 401 or 400 (not 200), verify no bypass, verify query parameterized/sanitized.

Parameters:
- Framework: Playwright test with request context (no browser)
- Base API URL from env
- Test user credentials from env or fixtures
- Token storage in test context (shared state between tests where needed)

Output format:
Complete TypeScript test spec using Playwright's request fixture, auth helper utilities (login, refresh, getToken), token store singleton for test isolation, and all 18 test cases with clear arrange-act-assert structure.

Tone: Security-first and standards-compliant. Reference OWASP API Top 10, RFC 6750 (Bearer Token), and RFC 7519 (JWT). Every test should map to a real-world attack vector it prevents.""", is_system=True),
                PromptTemplate(title="File Upload", description="File upload test suite covering single/multi/bulk uploads, file type validation, size limits, drag-and-drop, progress tracking, virus scanning, preview, and error recovery using Playwright TypeScript", category="file_upload", prompt_content="""Role: You are a Senior QA Engineer specializing in file handling and upload systems. You test like a user who uploads multi-gigabyte files on a spotty connection and expects zero data loss.

Instructions:
1. Create file-upload.spec.ts with POM for FileUploadPage, FilePreviewModal, and UploadProgress component.
2. Test via click-to-upload (file input) and drag-and-drop interactions.
3. Cover all file types in acceptance criteria: images (JPG, PNG, GIF, SVG, WEBP, BMP), documents (PDF, DOC, DOCX, XLSX, PPTX, TXT, CSV), media (MP4, MP3, WAV), archives (ZIP, RAR).
4. Test size boundaries: 0-byte empty file, 1 byte, just under limit, exactly at limit, 1 byte over limit, extremely large (10GB+).
5. Test concurrent uploads: multiple files simultaneously, upload while browsing, upload with network interruption/recovery.
6. Structure with TC_FUP_001 through TC_FUP_018.

Context:
File upload component supports single-file, multi-file (up to 10 at once), and drag-and-drop. Max file size 25MB per file, max 100MB total per upload batch. Allowed types configurable per context. Client-side validation for type and size before upload. Progress bar with percentage, transfer speed, and estimated time remaining. Chunked upload for files > 5MB (1MB chunks). Resumable uploads supported. Server-side virus scan on completion (async — status polling required). Uploaded files generate thumbnail preview for images, document icon for non-images. Failed uploads can be retried individually.

Examples of expected test cases:
- TC_FUP_001: Single file upload — click method → click upload area, select a valid JPG file (2MB), verify file name appears in upload queue, verify progress bar reaches 100%, verify success toast "1 file uploaded successfully", verify file appears in uploaded files list with thumbnail preview, verify download link works.
- TC_FUP_002: Single file upload — drag and drop → drag a PNG file from desktop to drop zone, verify drop zone highlights on dragover with "Drop files here" text, drop file, verify file added to queue, verify upload starts automatically, verify success.
- TC_FUP_003: Multiple files upload → select 5 images via file dialog or drag-and-drop 5 files, verify all 5 appear in queue with individual progress bars, verify all complete, verify "5 files uploaded successfully", verify all 5 appear with correct thumbnails.
- TC_FUP_004: Max file count limit → upload 10 files (the maximum), verify all accepted, attempt to add an 11th file, verify error "Maximum 10 files allowed per upload", verify 11th file not added to queue.
- TC_FUP_005: File size — exactly at limit → upload 25MB file, verify upload proceeds, verify progress, verify success with no truncation.
- TC_FUP_006: File size — exceeds limit → select 26MB file, verify client-side rejection "File 'large-file.zip' (26.0 MB) exceeds the 25 MB limit" before upload starts, verify file not in queue, verify existing queue items unaffected.
- TC_FUP_007: Empty file (0 bytes) → upload 0-byte file, verify client rejects with "File 'empty.txt' is empty and cannot be uploaded", or server returns 400 with "Empty files are not accepted".
- TC_FUP_008: Invalid file type → try to upload a .exe file (not in allowed types), verify "File type '.exe' is not supported. Allowed types: JPG, PNG, PDF, DOC, etc." error, verify file rejected before any network request.
- TC_FUP_009: File type validation bypass attempt → rename .exe to .jpg, upload, verify server-side magic-byte validation catches it, verify upload rejected with "File content does not match its extension", verify security log entry created.
- TC_FUP_010: Image preview → upload JPG, PNG, GIF, SVG, WEBP each, verify thumbnail generated for each, verify click to open full-screen preview modal, verify prev/next navigation between previews, verify close button, verify zoom functionality.
- TC_FUP_011: Document file handling → upload PDF, DOCX, XLSX, verify document-type icon shown instead of thumbnail, verify file size and type label shown, verify click to download (not preview).
- TC_FUP_012: Upload progress tracking → upload a large file (20MB) on throttled network (Slow 3G via Playwright context options), verify progress bar updates in real-time, verify percentage increases, verify speed (KB/s) displayed, verify ETA updates dynamically, verify completion at 100%.
- TC_FUP_013: Cancel upload mid-progress → start uploading a large file, click cancel/X during upload, verify upload stops, verify progress bar disappears, verify "Upload cancelled" toast, verify file removed from queue, verify server-side partial data cleaned up.
- TC_FUP_014: Network failure during upload → start upload, simulate network offline via page.route() abort, verify upload pauses, verify "Connection lost. Upload will resume when connection is restored." message, restore network, verify upload resumes from the last successful chunk (not from beginning).
- TC_FUP_015: Retry failed upload → upload a file that fails (mock server 500), verify error state with "Upload failed — [reason]" and Retry button, click Retry, verify upload restarts, verify success on retry.
- TC_FUP_016: Virus scan status → upload a file, verify "Scanning for viruses..." status indicator while scanning (mock polling until "clean" status), verify upload transitions to success once scan passes.
- TC_FUP_017: Concurrent uploads → start 3 file uploads simultaneously, verify all 3 progress independently, verify bandwidth shared, verify all complete, verify result count is 3.
- TC_FUP_018: Upload with special characters in filename → upload file named "Résumé (Final) v3.1 [Approved] — Copy.pdf", verify filename preserved correctly in queue and after upload, verify special characters URL-encoded correctly in API request, verify downloaded file has original name.

Parameters:
- Framework: Playwright TypeScript
- Test files generated in test fixtures directory (various sizes, types, names)
- Network throttling via Playwright context options
- Mock upload API with chunk support via page.route
- File input simulation via setInputFiles and drag-and-drop via dataTransfer

Output format:
Complete TypeScript spec with FileUploadPage POM, file-generation utilities (create test files of specific sizes/types), mock server handlers for chunked upload simulation, and all 18 test cases. Include a test-fixtures/ directory with pre-generated test files.

Tone: Reliability-focused. File upload failures lose user work and trust. Test every failure mode as if someone's important documents depend on it — because they do. Emphasize data integrity and user communication during errors.""", is_system=True),
            ]
            db.add_all(prompts)

        t_count = (await db.execute(select(func.count(ScriptTemplate.id)).where(ScriptTemplate.is_system == True))).scalar()
        if t_count == 0:
            seed_file = Path(__file__).parent / "template_seeds.json"
            seed_data = json.loads(seed_file.read_text(encoding="utf-8"))
            templates = [
                ScriptTemplate(
                    title=item["title"],
                    description=item["description"],
                    domain=item["domain"],
                    framework=item["framework"],
                    template_content=item["template_content"],
                    is_system=True,
                )
                for item in seed_data
            ]
            db.add_all(templates)

        await db.commit()


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(scripts.router)
app.include_router(prompts.router)
app.include_router(templates.router)
app.include_router(settings_router.router)
app.include_router(admin.router)

STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api/"):
        return JSONResponse({"detail": "Not Found"}, status_code=404)
    file_path = STATIC_DIR / full_path
    if file_path.exists() and file_path.is_file():
        return FileResponse(str(file_path))
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return HTMLResponse(index_path.read_text(encoding="utf-8"))
    return {"detail": "Not Found"}
