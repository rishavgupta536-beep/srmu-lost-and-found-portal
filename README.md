# SRMU Campus Lost & Found Portal

A full-stack campus item recovery web application built with HTML, Tailwind CSS, JavaScript, Python (Flask), and SQLite for Shri Ramswaroop Memorial University (SRMU).

## Submitted By
* **Name:** Rishav Prakash Gupta
* **Roll No:** 202410101110244
* **Course:** B.Tech Computer Science and Engineering (3rd Year), Group 59, 50 — Shri Ramswaroop Memorial University
* **Subject:** Full Stack Web Development

## Features
* **Landing Showcase (`/`):** Glassmorphism welcome portal featuring SRMU branding, logo, and direct navigation to reporting desks.
* **Lost Items Portal (`/lost`):** 5-field lost item registration form with image upload, live search filter, and status updates (`Mark Resolved` / `Delete`).
* **Found Items Portal (`/found`):** 6-field found item reporting with custody handover tracking (`Submitted To`) and return confirmation (`Mark Returned`).
* **RESTful Backend & Storage:** Asynchronous Fetch API communication backed by Python Flask routes, secure image uploads, and SQLite database persistence.

## How to Run
1. Install Flask:
   ```bash
   pip install -r requirements.txt