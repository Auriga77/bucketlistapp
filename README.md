## 💻 Local Development Setup

To run this project locally, you need your own AWS Account.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or later)
* [AWS Account](https://aws.amazon.com/) with active credentials configured locally (via `aws configure` or environment variables).

### Steps
1.  **Clone the repository**
    ```bash
    git clone (https://github.com/Auriga77/bucketlistapp.git)
    cd bucketlistapp
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the Cloud Sandbox**
    *This will provision a temporary backend in YOUR AWS account.*
    ```bash
    npx ampx sandbox
    ```

4.  **Run the Frontend**
    ```bash
    npm run dev
    ```