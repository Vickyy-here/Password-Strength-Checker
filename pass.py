import tkinter as tk
from tkinter import messagebox
import re
import random
import string

COMMON_PASSWORDS = [
    "password", "password123", "123456",
    "qwerty", "admin", "welcome", "letmein"
]


def check_strength(password):
    score = 0
    feedback = []

    if len(password) >= 8:
        score += 20
    else:
        feedback.append("❌ Password should be at least 8 characters.")

    if len(password) >= 12:
        score += 10

    if re.search(r"[A-Z]", password):
        score += 15
    else:
        feedback.append("❌ Add an uppercase letter.")

    if re.search(r"[a-z]", password):
        score += 15
    else:
        feedback.append("❌ Add a lowercase letter.")

    if re.search(r"\d", password):
        score += 15
    else:
        feedback.append("❌ Add a number.")

    if re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        score += 15
    else:
        feedback.append("❌ Add a special character.")

    if password.lower() in COMMON_PASSWORDS:
        score = 10
        feedback.append("❌ This is a common password.")

    if len(set(password)) < len(password) / 2:
        score -= 10
        feedback.append("❌ Too many repeated characters.")

    score = max(0, min(score, 100))

    if score < 30:
        level = "Very Weak"
        color = "red"
    elif score < 50:
        level = "Weak"
        color = "orange"
    elif score < 70:
        level = "Medium"
        color = "gold"
    elif score < 90:
        level = "Strong"
        color = "green"
    else:
        level = "Very Strong"
        color = "dark green"

    return score, level, color, feedback


def analyze():
    password = entry.get()

    score, level, color, feedback = check_strength(password)

    result.config(
        text=f"Strength: {level}\nScore: {score}/100",
        fg=color
    )

    progress["width"] = score * 3

    feedback_box.delete("1.0", tk.END)

    if feedback:
        for item in feedback:
            feedback_box.insert(tk.END, item + "\n")
    else:
        feedback_box.insert(
            tk.END,
            "✅ Excellent password!\n"
        )


def generate_password():
    chars = string.ascii_letters + string.digits + "!@#$%^&*"

    password = ''.join(random.choice(chars) for _ in range(16))

    entry.delete(0, tk.END)
    entry.insert(0, password)


def copy_password():
    root.clipboard_clear()
    root.clipboard_append(entry.get())
    messagebox.showinfo("Copied", "Password copied!")


root = tk.Tk()
root.title("Password Strength Checker")
root.geometry("500x500")
root.configure(bg="#1e1e1e")

title = tk.Label(
    root,
    text="🔒 Password Strength Checker",
    bg="#1e1e1e",
    fg="cyan",
    font=("Arial", 18, "bold")
)
title.pack(pady=15)

entry = tk.Entry(
    root,
    width=35,
    font=("Arial", 14),
    show="*"
)
entry.pack(pady=10)

frame = tk.Frame(root, bg="#1e1e1e")
frame.pack()

check_btn = tk.Button(
    frame,
    text="Check",
    command=analyze,
    bg="cyan"
)
check_btn.grid(row=0, column=0, padx=5)

gen_btn = tk.Button(
    frame,
    text="Generate",
    command=generate_password,
    bg="lightgreen"
)
gen_btn.grid(row=0, column=1, padx=5)

copy_btn = tk.Button(
    frame,
    text="Copy",
    command=copy_password,
    bg="orange"
)
copy_btn.grid(row=0, column=2, padx=5)

canvas = tk.Canvas(
    root,
    width=300,
    height=20,
    bg="white"
)
canvas.pack(pady=15)

progress = canvas.create_rectangle(
    0,
    0,
    0,
    20,
    fill="green"
)

result = tk.Label(
    root,
    text="",
    bg="#1e1e1e",
    fg="white",
    font=("Arial", 14, "bold")
)
result.pack()

feedback_box = tk.Text(
    root,
    width=55,
    height=10,
    font=("Arial", 10)
)
feedback_box.pack(pady=15)

root.mainloop()