# Deploying Wildlife Guardian to AWS

This simple guide will help a student team deploy the Wildlife Guardian project in less than 1 day.

## 1. Hosting the Frontend (JavaScript/HTML/CSS)
Since our frontend does not rely on a NodeJS server to run (it uses basic vanilla JS and `localStorage`), it is entirely static.

**Option A (Recommended & Easiest): AWS Amplify Hosting**
1. Zip up the files in the project directory (`css/`, `js/`, `index.html`) into a single `.zip` file.
2. Go to the **AWS Amplify Console**.
3. Scroll down to *Amplify Hosting* and select "Get Started".
4. Choose **"Deploy without Git provider"**.
5. Upload your `.zip` file.
6. Click "Save and Deploy". AWS will give you a live, secure HTTPS link in minutes!

**Option B: Amazon S3**
1. Create an S3 Bucket (e.g., `wildlife-guardian-app-2026`).
2. Enable "Static website hosting" in the bucket properties.
3. Uncheck "Block all public access".
4. Upload your files. Check that the files are publicly readable via bucket policy.

## 2. Hosting the Streamlit Camera App
Streamlit runs Python, so it needs a basic server to stay alive.

**The Free/Student Way: Streamlit Community Cloud**
1. Push your `streamlit_model` folder to a GitHub repository.
2. Log in to [Streamlit Community Cloud](https://streamlit.io).
3. Connect your GitHub account and select your repository/app.py.
4. Streamlit hosts it for free.

**The AWS Way:**
1. Launch an EC2 Instance (Amazon Linux 2023 or Ubuntu, t2.micro is free-tier eligible).
2. Ensure your EC2 Security Group allows inbound TCP traffic on port `80` (HTTP) and `22` (SSH).
3. SSH into the instance: `ssh -i key.pem ec2-user@YOUR_IP`.
4. Install Python and pip.
5. Upload your `app.py` and `requirements.txt`.
6. Run `pip install -r requirements.txt`.
7. Run the app: `python3 -m streamlit run app.py --server.port 80`. (You may need `sudo` for port 80).

## 3. Real Cloud Database (Future Step)
Currently, stats are saved in the browser's `localStorage` to keep development fast. When you're ready to sync across devices:
1. Create a table in **Amazon DynamoDB** called `Pets` (Partition key: `userID`).
2. Create an **AWS Lambda** function (Python or Node.js) to read/write stats to this table.
3. Connect the Lambda function to an **Amazon API Gateway** to get an API URL.
4. Update `js/app.js` to use `fetch(API_URL)` to load and save states to the cloud instead of `localStorage`.
