
# 🕵️‍♂️ Deepfake Detection Web App

A web application that detects deepfake images using a deep learning model trained on the Celeb-DF v2 dataset. Users can upload images to check if they are real or fake.

---

## 🚀 Features

- Upload and analyze images (JPG, PNG, JPEG, WEBP)
- EfficientNetB4-based deepfake detection
- Real-time prediction results
- Responsive frontend using HTML + CSS (Flask templating)
- Includes pages: Home, About, Privacy Policy, Terms, Contact

---

## 🧠 Model Info

- **Model**: EfficientNetB4 (trained on Celeb-DF v2)
- **Accuracy**: ~90%
- **Input Size**: 380x380x3
- **Framework**: TensorFlow / Keras

---

## 📁 Project Structure

```
deepfake_webapp/
│
├── app.py                   # Main Flask application
├── best_model_b4.h5         # Trained model file
├── static/
│   └── style.css            # CSS styles
├── templates/
│   ├── index.html           # Home page
│   ├── result.html          # Results page
│   ├── about.html           # About us
│   ├── privacy.html         # Privacy policy
│   ├── terms.html           # Terms & conditions
│   └── contact.html         # Contact page
├── uploads/                 # Folder for uploaded files
│   └── (empty initially)
├── requirements.txt         # Python dependencies
└── README.md                # This file
```

---

## 💻 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/deepfake_webapp.git
   cd deepfake_webapp
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Access the app**  
   Open a browser and go to:  
   [[http://127.0.0.1:5000](http://localhost:5000)

---

## 👨‍💻 Team – Crew 8 Bits

- Abhinash Balaji (Team Lead)  
- Augustin Miranda R  
- Akshaya V  
- Deekshaa K  
- Danish Basha N  

**Mentors:**  
- Dr. G. Mahalakshmi  
- Dr. C. Niroshini Infantia  

---

## 🛡️ Disclaimer

This app is for academic and research purposes only. Not intended for commercial or forensic use.

---

## 📬 Contact

For queries, reach out via the **Contact Us** page on the web app or email the contributors directly.
