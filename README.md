# 📱 WhatsApp Mini Bot - Complete Deployment Guide

[![Node.js Version](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Baileys-25D366.svg)](https://github.com/WhiskeySockets/Baileys)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/whatsapp-bot)

A powerful, production-ready WhatsApp bot with database integration, web dashboard, and easy pairing system. Perfect for automation, customer support, and broadcasting.

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [WhatsApp Pairing System](#-whatsapp-pairing-system)
  - [Method 1: QR Code Pairing](#method-1-qr-code-pairing)
  - [Method 2: Web-Based Pairing Button](#method-2-web-based-pairing-button)
  - [Method 3: Pairing Code (No QR)](#method-3-pairing-code-no-qr)
- [Complete Bot Code](#-complete-bot-code)
- [Commands](#-commands)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Web Dashboard](#-web-dashboard)
- [Troubleshooting](#-troubleshooting)
- [Support](#-support)

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Easy Pairing** | WhatsApp Web pairing with QR code or 8-digit code |
| 💾 **Database Integration** | SQLite/PostgreSQL support for user data |
| 📊 **Web Dashboard** | Real-time stats and monitoring |
| 📢 **Broadcast System** | Send messages to all users |
| 🤖 **Command Handler** | Easy to extend with custom commands |
| 🔄 **Auto-Reconnect** | Automatically reconnects if disconnected |
| 📈 **Analytics** | Track user engagement and message stats |
| 🔒 **Session Persistence** | No need to scan QR every time |
| ⚡ **High Performance** | Handles thousands of messages efficiently |
| 🌐 **REST API** | Complete API for external integrations |
| 📱 **Multi-Device** | Supports WhatsApp Multi-Device beta |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/whatsapp-mini-bot.git
cd whatsapp-mini-bot

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start the bot
npm start

# Scan QR code shown in terminal with WhatsApp
# Open WhatsApp → Linked Devices → Link a Device

<!-- public/dashboard.html -->
<!DOCTYPE html>
<html>
<head>
    <title>WhatsApp Bot Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stats-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 20px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            margin: 10px 0;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        .chart-container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .broadcast-section {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px;
        }
        textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin: 10px 0;
            font-size: 14px;
        }
        button {
            background: #25D366;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
        }
        button:hover {
            background: #128C7E;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 WhatsApp Bot Dashboard</h1>
        <p>Real-time monitoring and control</p>
    </div>
    
    <div class="stats-container" id="stats">
        <div class="stat-card">
            <div class="stat-label">Total Users</div>
            <div class="stat-value" id="totalUsers">-</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Messages Today</div>
            <div class="stat-value" id="messagesToday">-</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Bot Status</div>
            <div class="stat-value" id="botStatus">-</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Uptime</div>
            <div class="stat-value" id="uptime">-</div>
        </div>
    </div>
    
    <div class="chart-container">
        <canvas id="messageChart"></canvas>
    </div>
    
    <div class="broadcast-section">
        <h3>📢 Broadcast Message</h3>
        <textarea id="broadcastMsg" rows="3" placeholder="Type your broadcast message here..."></textarea>
        <button onclick="sendBroadcast()">Send to All Users</button>
        <div id="broadcastResult"></div>
    </div>
    
    <script>
        async function loadStats() {
            const response = await fetch('/api/stats');
            const data = await response.json();
            
            document.getElementById('totalUsers').textContent = data.totalUsers || 0;
            document.getElementById('messagesToday').textContent = data.messagesToday || 0;
            document.getElementById('botStatus').textContent = data.botStatus === 'online' ? '🟢 Online' : '🔴 Offline';
            document.getElementById('uptime').textContent = data.uptime || '0s';
        }
        
        async function sendBroadcast() {
            const message = document.getElementById('broadcastMsg').value;
            if (!message) {
                alert('Please enter a message');
                return;
            }
            
            const response = await fetch('/api/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            
            const result = await response.json();
            document.getElementById('broadcastResult').innerHTML = 
                `<p style="color: green; margin-top: 10px;">✅ ${result.message}</p>`;
            document.getElementById('broadcastMsg').value = '';
            
            setTimeout(() => {
                document.getElementById('broadcastResult').innerHTML = '';
            }, 5000);
        }
        
        // Load stats every 10 seconds
        loadStats();
        setInterval(loadStats, 10000);
        
        // Chart configuration
        const ctx = document.getElementById('messageChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Messages per Hour',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
        
        // Update chart every minute
        async function updateChart() {
            const response = await fetch('/api/message-stats');
            const data = await response.json();
            // Update chart data
        }
        setInterval(updateChart, 60000);
    </script>
</body>
</html>
