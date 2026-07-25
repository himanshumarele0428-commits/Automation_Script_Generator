ROLE

You are a Senior Full Stack AI Engineer, Senior QA Automation Architect, UI/UX Designer, and Python + React expert.

Your task is to build a production-ready AI-powered web application named:

AI Automation Script Generator

The application should generate complete automation scripts from natural language test steps using an LLM (Groq/OpenAI/Gemini).

The application should be modular, scalable, secure, and follow industry best practices.

==================================================

APPLICATION OVERVIEW

Build an AI-powered application where users enter manual test steps or user scenarios, select an automation framework, and receive a complete automation script.

Example Input

Login
Add Product
Checkout
Logout

Example Output

Generate complete executable automation scripts for:

• Selenium Java
• Selenium Python
• Playwright JavaScript
• Playwright TypeScript
• Cypress
• Robot Framework

==================================================

TECH STACK

Frontend

• React 19
• TypeScript
• Vite
• Tailwind CSS
• React Router
• Axios
• React Hook Form
• Monaco Code Editor
• Framer Motion
• Hero Icons

Backend

• Python 3.12
• FastAPI
• Pydantic
• SQLAlchemy
• PostgreSQL
• JWT Authentication
• Redis (optional)
• Celery (optional)

AI

Allow switching between

• Groq
• OpenAI
• Gemini

Database

PostgreSQL

Deployment

Vercel

==================================================

AUTHENTICATION

Implement

Signup

Login

Forgot Password

Reset Password

JWT authentication

Profile Page

Logout

==================================================

DASHBOARD

Beautiful modern dashboard containing

Total Scripts Generated

Today's Scripts

Favourite Scripts

History

Recent Activity

Framework Usage Graph

Language Usage Graph

==================================================

LEFT SIDEBAR

Dashboard

Generate Script

History

Templates

Prompt Library

Saved Scripts

AI Settings

Profile

Admin

Logout

==================================================

SCRIPT GENERATOR PAGE

Large text area

Placeholder

Example

Login

Search Product

Add Product

Checkout

Logout

Dropdown

Select Framework

Options

Selenium Java

Selenium Python

Playwright JavaScript

Playwright TypeScript

Cypress

Robot Framework

Dropdown

Browser

Chrome

Firefox

Edge

Safari

Dropdown

Design Pattern

Page Object Model

Screenplay

Keyword Driven

Hybrid

Checkboxes

Include Assertions

Generate Comments

Use Explicit Waits

Error Handling

Logging

Screenshots

Retry Logic

Generate Test Data

Button

Generate Script

==================================================

AI PROMPT LOGIC

The backend should create an optimized prompt.

Example

You are a Senior Automation Test Architect.

Generate a production-ready automation framework.

Framework:
Playwright TypeScript

Scenario

Login

Search Product

Add Product

Checkout

Logout

Requirements

Use best coding practices.

Follow Page Object Model.

Generate reusable methods.

Add comments.

Use assertions.

Handle exceptions.

Use explicit waits.

Use clean naming conventions.

Make the script executable.

Return only code.

==================================================

OUTPUT SECTION

Use Monaco Editor

Syntax highlighting

Copy Button

Download Button

Save Button

Favourite Button

Share Button

Fullscreen Button

Dark Mode

Light Mode

==================================================

DOWNLOAD OPTIONS

Download as

.java

.py

.js

.ts

.robot

.txt

.pdf

.docx

.zip

==================================================

SAVE HISTORY

Save every generation

Store

Prompt

Framework

Language

Generated Code

Date

Time

AI Model

Execution Time

==================================================

PROMPT LIBRARY

Provide ready-made prompts

Login Test

Registration

Checkout

Payment

Search

Cart

Order

Profile

Logout

API Login

CRUD

File Upload

File Download

Multi User

Role Based

==================================================

SCRIPT TEMPLATES

Provide reusable templates

E-commerce

Banking

Healthcare

Insurance

CRM

HRMS

ERP

Travel

Education

==================================================

ADVANCED AI OPTIONS

Temperature

Top P

Maximum Tokens

System Prompt

Custom Prompt

==================================================

AI SETTINGS

Switch AI provider

Groq

OpenAI

Gemini

Store API Keys securely.

==================================================

ADMIN PANEL

Users

Generated Scripts

Prompt Analytics

Framework Analytics

Daily Usage

Monthly Usage

API Consumption

Error Logs

==================================================

SEARCH

Search generated scripts

Search by

Framework

Keyword

Date

Language

==================================================

FILTERS

Today

Yesterday

This Week

This Month

Custom Date

==================================================

EXPORT

Export history

Excel

CSV

PDF

==================================================

CODE QUALITY

Generated scripts should include

Imports

Configuration

Locators

Page Objects

Reusable Methods

Assertions

Logging

Screenshots

Exception Handling

Retry Logic

Comments

==================================================

EXAMPLE OUTPUT

If user selects

Playwright TypeScript

Generate

tests/
login.spec.ts

pages/
LoginPage.ts

utils/
BasePage.ts

fixtures/
testData.ts

playwright.config.ts

README.md

==================================================

ANOTHER EXAMPLE

If Selenium Java selected

Generate

BaseTest.java

DriverFactory.java

LoginPage.java

CheckoutPage.java

HomePage.java

LoginTest.java

config.properties

pom.xml

README.md

==================================================

UI DESIGN

Professional SaaS dashboard

Rounded cards

Gradient buttons

Responsive layout

Dark mode

Light mode

Loading animation

Typing animation while AI generates code

Toast notifications

Skeleton loaders

==================================================

SECURITY

Validate all inputs.

Sanitize prompts.

Prevent prompt injection.

Rate limiting.

JWT authentication.

Encrypted API keys.

==================================================

PROJECT STRUCTURE

frontend/

backend/

database/

docker/

docs/

tests/

==================================================

BONUS FEATURES

Voice input

Drag-and-drop requirement documents

Generate scripts from uploaded PDF, DOCX, or Excel

Convert manual test cases into automation

Generate API automation scripts

Generate mobile automation (Appium)

Generate Playwright fixtures

Generate Page Object Models

Generate test data

Generate CI/CD pipeline (GitHub Actions/Jenkins)

Generate Allure reporting configuration

Generate Docker setup

Generate README documentation

Generate framework folder structure

==================================================

NON-FUNCTIONAL REQUIREMENTS

Clean Architecture

SOLID principles

Repository Pattern

Reusable components

Modular services

Async backend

Production-ready code

Comprehensive error handling

Logging

Unit tests

API documentation using Swagger

==================================================

DELIVERABLES

Generate:

1. Complete React frontend
2. Complete FastAPI backend
3. PostgreSQL database schema
4. Authentication module
5. AI integration layer
6. Prompt engineering module
7. History module
8. Admin panel
9. Docker and Docker Compose configuration
10. README with setup instructions
11. Sample environment (.env.example)
12. API documentation
13. Unit tests for backend
14. Responsive UI
15. Production-ready folder structure

The generated project should be fully functional, well-documented, and ready for local development and deployment.