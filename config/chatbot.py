import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from flask import Flask, request, jsonify
from flask_cors import CORS
from waitress import serve
import csv
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Download required NLTK data
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
stop_words = set(stopwords.words('english'))

# Load and prepare the data
queries = []
responses = []

with open('../config/train_data.csv', 'r') as file:
    csv_reader = csv.reader(file)
    next(csv_reader)  # Skip header
    for row in csv_reader:
        queries.append(row[0])
        responses.append(row[1])

print("Data loaded successfully.")

def preprocess_text(text):
    tokens = word_tokenize(text.lower())
    return ' '.join([t for t in tokens if t not in stop_words])

# Preprocess queries
processed_queries = [preprocess_text(query) for query in queries]

# Train the model
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(processed_queries)
model = MultinomialNB()
model.fit(X, responses)

print("Model trained successfully.")

# Define the chatbot function
def chatbot(query):
    processed_query = preprocess_text(query)
    query_vector = vectorizer.transform([processed_query])
    prediction = model.predict(query_vector)
    return prediction[0]

# Initialize the Flask app
app = Flask(__name__)
CORS(app, resources={r"/chatbot": {"origins": "http://localhost:3000"}})

# Route for the chatbot API
@app.route('/chatbot', methods=['POST'])
def chatbot_endpoint():
    logging.debug("Received request: %s", request.json)
    query = request.json['query']
    response = chatbot(query)
    logging.debug("Sending response: %s", response)
    return jsonify({'response': response})

if __name__ == '__main__':
    print("Starting Flask app with Waitress...")
    serve(app, host='0.0.0.0', port=8000)
    print("Flask app is running on http://localhost:8000")