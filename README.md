# 🚀 NeuroValidate (Startup Validator Agent)

NeuroValidate is an AI-powered, full-stack web application designed to act as a virtual co-founder and interactive consultant for entrepreneurs. It instantly takes raw startup ideas, identifies market gaps, assesses risks, and generates structured business plans alongside interactive financial dashboards.

## ✨ Key Features

*   **💬 The Virtual Co-Founder:** Chat naturally with an advanced AI (powered by Groq & Llama-3) that acts as a smart sounding board, streaming personalized business advice in real-time.
*   **📊 Dynamic Risk Dashboard:** While the AI chats with you, it secretly crunches data in the background to automatically build interactive charts (Radar, Column, Donut) visualizing your specific startup hurdles like regulatory risk or tech debt.
*   **💸 Financial Sandbox:** Play with interactive sliders to adjust key assumptions like Monthly Price, Customer Acquisition Cost (CAC), and Marketing Budgets to instantly watch your 12-month cash burn and MRR projections update live.
*   **📄 Instant Pitch Decks:** With a single click, convert your interactive dashboards and AI insights into a professional, downloadable PDF pitch deck ready for investors.
*   **🌐 Immersive UI:** Features a sleek, modern landing page with a rotating 3D wireframe globe and a highly responsive, dark-mode-first Tailwind design.

---

## 🛠️ Tech Stack

### **Frontend (The Face)**
*   **Framework:** [Next.js](https://nextjs.org/) (App Router) & [React](https://react.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Data Visualization:** [Recharts](https://recharts.org/)
*   **3D Graphics:** [Three.js](https://threejs.org/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Export Tools:** `html2canvas` & `jspdf`

### **Backend & AI (The Brains)**
*   **API/Server:** Next.js Route Handlers (`app/api/chat/route.ts`)
*   **AI Orchestration:** [Vercel AI SDK](https://sdk.vercel.ai/docs) (`@ai-sdk/react`, `ai`)
*   **LLM Inference:** [Groq](https://groq.com/) (`@ai-sdk/groq` using the `llama-3.3-70b-versatile` model)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed. You will also need an API key from [Groq](https://console.groq.com/) to power the AI agent.

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/startup-validator-agent.git](https://github.com/your-username/startup-validator-agent.git)
cd startup-validator-agent

2. Install dependencies
Bash
npm install
(Note: Dependencies like jspdf and html2canvas for the PDF export feature are already included in the package.json.)

3. Set up environment variables
Create a .env.local file in the root directory of your project and add your Groq API key:

Code snippet
GROQ_API_KEY=your_groq_api_key_here
4. Run the development server
Bash
npm run dev
Open http://localhost:3000 in your browser to see the application running.

📂 Project Structure
app/page.tsx: The main frontend file containing the Landing Page, Chat Interface, and the interactive BI Dashboard components.

app/api/chat/route.ts: The backend API route that securely handles the Llama-3 prompt engineering, JSON data extraction instructions, and streaming the response back to the client.

app/globals.css: Global Tailwind CSS imports and custom base styling.

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

📝 License
This project is open-source and available under the MIT License.
