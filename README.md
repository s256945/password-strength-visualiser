# 🔑 Password Strength Visualiser

A simple React app that analyses and visualises the strength of a password in real-time.  
It uses [Dropbox’s zxcvbn](https://github.com/dropbox/zxcvbn) library for entropy estimates,  
with some extra checks (like keyboard sequences) and a friendly visual bar.

---

## ✨ Features

- Live password strength feedback as you type
- Entropy estimate (bits)
- Strength bands: Very Weak → Very Strong
- Crack-time feedback (via zxcvbn)
- Pattern findings (dictionary words, repeats, sequences, keyboard walks)
- Actionable advice for stronger passwords
- Visual progress bar with color indicators

---

## 🛠 Tech Stack

- [React](https://react.dev/) (Create React App)
- [zxcvbn](https://www.npmjs.com/package/zxcvbn) for password analysis

---

## 🚀 Getting Started

### 1. Clone this repo
```bash
git clone https://github.com/yourusername/password-visualiser.git
cd password-visualiser
```

### 2. Install dependencies
```bash
npm install
```

### 2. Run the app
```bash
npm start
```
