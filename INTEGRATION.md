# K2Surg Blockchain Integration Documentation

## Project Overview

K2Surg is a blockchain-based VR application that integrates with Ethereum smart contracts to record performance metrics and mint reward NFTs. This document covers the current implementation, what has been completed, what is in progress, and the roadmap for future development.

---

## ✅ What We Have Done

### 1. **Backend Infrastructure**
- **Smart Contracts**: Deployed `K2SurgReward.sol` and `K2SurgRewardNFT.sol` on Ethereum Sepolia testnet
  - `K2SurgReward`: Records performance data and triggers reward logic
  - `K2SurgRewardNFT`: Mints NFT rewards for eligible players
- **Contract Addresses**:
  - K2SurgReward: `0xD5eAe2375D4cAb0cf2c5902fD73b927f25CdA7c4`
  - K2SurgRewardNFT: `0xA19DC6E12e7C9cc023bE266b1C2AB4aEE64830aD`

### 2. **Backend API (Next.js on Vercel)**
- **Deployed URL**: https://k2surg-blockchain.vercel.app/
- **Environment**: Vercel serverless functions (Node.js runtime)
- **Environment Variables**: `RPC_URL`, `PRIVATE_KEY`, `CONTRACT_ADDRESS`

### 3. **API Endpoints**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check and connectivity test |
| `/api/status` | GET | Contract status, threshold, and reward NFT address |
| `/api/record` | POST | Record performance (score, transfers, penalties) |
| `/api/performance` | POST/GET | Alias for `/api/record` |

### 4. **Dashboard UI**
- **Technology**: React + Next.js (App Router)
- **Styling**: CSS-in-JS with animations (fade-in effects)
- **Features**:
  - Real-time contract status display
  - Health check indicator
  - Performance metrics chart (recharts)
  - API testing form to submit performance data
  - Live transaction feedback with hash display
  - Auto-refresh every 15 seconds
  - Responsive design (mobile + desktop)

### 5. **Database & Storage**
- **On-chain Storage**: Ethereum blockchain (Sepolia testnet)
- **Off-chain**: None (all data is derived from blockchain events)

### 6. **Security & Configuration**
- Environment variables properly managed in Vercel
- `.env` file gitignored locally
- `.next` build artifacts ignored
- Production error handling with explicit error messages
- CORS enabled for all origins

---

## 🔄 What We Are Doing Now

### 1. **Dashboard Enhancement**
- Added form to test performance recording directly from the UI
- Real-time API response feedback
- Transaction hash display
- Event emission confirmation
- Auto-refresh data after successful submission

### 2. **API Standardization**
- Created `/api/record` endpoint as the primary Unity API
- Standardized error messages and response formats
- Explicit environment variable validation

### 3. **Documentation**
- Creating this comprehensive integration guide
- Including Unity code examples
- Providing step-by-step setup instructions

---

## 📋 What We Will Do

### Phase 1: Unity Integration (Next)
- [ ] Provide Unity C# code for making API calls
- [ ] Create a prefab-based manager for blockchain interactions
- [ ] Implement retry logic and timeout handling
- [ ] Add error reporting and logging to console

### Phase 2: Enhanced Features
- [ ] Add leaderboard API endpoint `/api/leaderboard`
- [ ] Implement caching strategy for off-chain data
- [ ] Add pagination for large datasets
- [ ] Create write-ahead logging for transaction status

### Phase 3: Security & Monitoring
- [ ] Implement rate limiting on API endpoints
- [ ] Add request signature verification
- [ ] Create monitoring dashboard in Vercel
- [ ] Set up error alerting via webhook

### Phase 4: Advanced Integrations
- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] Decentralized storage (IPFS integration)
- [ ] DAO governance for reward rules
- [ ] Cross-game scoreboard (if applicable)

---

# Unity Integration Guide

## 🚀 Getting Started

### Prerequisites
- Unity 2020.3 or higher
- C# scripting knowledge
- Basic understanding of REST APIs
- Ethereum/Web3 basics (optional but helpful)

### Setup Steps

#### 1. Create a Blockchain Manager Script

Create a new C# script `BlockchainManager.cs`:

```csharp
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;

public class BlockchainManager : MonoBehaviour
{
    // Singleton instance
    public static BlockchainManager Instance { get; private set; }

    // Configuration
    [SerializeField] private string apiBaseUrl = "https://k2surg-blockchain.vercel.app";
    [SerializeField] private float requestTimeout = 30f;
    
    // Events
    public delegate void OnPerformanceRecorded(PerformanceResult result);
    public event OnPerformanceRecorded PerformanceRecorded;
    
    public delegate void OnError(string error);
    public event OnError ErrorOccurred;

    // Data structures
    [System.Serializable]
    public class PerformanceData
    {
        public int score;
        public int transfers;
        public int penalties;
    }

    [System.Serializable]
    public class PerformanceResult
    {
        public string txHash;
        public TransactionEvent txEvent;
        public int blockNumber;
        public string error;
    }

    [System.Serializable]
    public class TransactionEvent
    {
        public string user;
        public string score;
        public bool minted;
    }

    [System.Serializable]
    public class ContractStatus
    {
        public string status;
        public string contractAddress;
        public string rewardThreshold;
        public string rewardNFT;
        public string error;
    }

    private void Awake()
    {
        // Singleton pattern
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
        DontDestroyOnLoad(gameObject);
    }

    public void RecordPerformance(int score, int transfers, int penalties)
    {
        PerformanceData data = new PerformanceData
        {
            score = score,
            transfers = transfers,
            penalties = penalties
        };
        
        StartCoroutine(PostPerformanceData(data));
    }

    private IEnumerator PostPerformanceData(PerformanceData data)
    {
        string url = $"{apiBaseUrl}/api/record";
        string jsonData = JsonUtility.ToJson(data);
        
        using (UnityWebRequest request = new UnityWebRequest(url, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.timeout = (int)requestTimeout;
            
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                try
                {
                    PerformanceResult result = JsonUtility.FromJson<PerformanceResult>(request.downloadHandler.text);
                    PerformanceRecorded?.Invoke(result);
                    Debug.Log($"✓ Performance recorded! TX: {result.txHash}");
                }
                catch (System.Exception e)
                {
                    ErrorOccurred?.Invoke($"Failed to parse response: {e.Message}");
                    Debug.LogError($"Parse error: {e}");
                }
            }
            else
            {
                string errorMsg = request.error ?? request.downloadHandler.text;
                ErrorOccurred?.Invoke(errorMsg);
                Debug.LogError($"✗ Error: {errorMsg}");
            }
        }
    }

    public void GetContractStatus()
    {
        StartCoroutine(FetchContractStatus());
    }

    private IEnumerator FetchContractStatus()
    {
        string url = $"{apiBaseUrl}/api/status";
        
        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            request.timeout = (int)requestTimeout;
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                try
                {
                    ContractStatus status = JsonUtility.FromJson<ContractStatus>(request.downloadHandler.text);
                    Debug.Log($"✓ Contract Status: {status.contractAddress}");
                }
                catch (System.Exception e)
                {
                    ErrorOccurred?.Invoke($"Failed to parse status: {e.Message}");
                }
            }
            else
            {
                ErrorOccurred?.Invoke($"Status check failed: {request.error}");
                Debug.LogError($"Status error: {request.error}");
            }
        }
    }

    public void GetHealthCheck()
    {
        StartCoroutine(FetchHealthCheck());
    }

    private IEnumerator FetchHealthCheck()
    {
        string url = $"{apiBaseUrl}/api/health";
        
        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            request.timeout = (int)requestTimeout;
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("✓ API is healthy!");
            }
            else
            {
                ErrorOccurred?.Invoke($"Health check failed: {request.error}");
                Debug.LogError($"Health error: {request.error}");
            }
        }
    }
}
```

#### 2. Create a Performance Recorder Script

Create `PerformanceRecorder.cs` to handle game logic:

```csharp
using UnityEngine;

public class PerformanceRecorder : MonoBehaviour
{
    [SerializeField] private int playerScore = 0;
    [SerializeField] private int transferCount = 0;
    [SerializeField] private int penaltyCount = 0;

    private BlockchainManager blockchain;

    private void Start()
    {
        blockchain = BlockchainManager.Instance;
        
        // Subscribe to events
        if (blockchain != null)
        {
            blockchain.PerformanceRecorded += OnPerformanceSuccess;
            blockchain.ErrorOccurred += OnPerformanceError;
        }
    }

    public void AddScore(int points)
    {
        playerScore += points;
        Debug.Log($"Score updated: {playerScore}");
    }

    public void AddTransfer()
    {
        transferCount++;
        Debug.Log($"Transfer recorded: {transferCount}");
    }

    public void AddPenalty()
    {
        penaltyCount++;
        Debug.Log($"Penalty added: {penaltyCount}");
    }

    public void SubmitPerformance()
    {
        if (blockchain == null)
        {
            Debug.LogError("BlockchainManager not found!");
            return;
        }

        Debug.Log($"Submitting: Score={playerScore}, Transfers={transferCount}, Penalties={penaltyCount}");
        blockchain.RecordPerformance(playerScore, transferCount, penaltyCount);
    }

    private void OnPerformanceSuccess(BlockchainManager.PerformanceResult result)
    {
        Debug.Log($"✓ Success! TX Hash: {result.txHash}");
        if (result.txEvent != null && result.txEvent.minted)
        {
            Debug.Log("🎉 NFT Minted!");
        }
        // Reset scores after successful submission
        playerScore = 0;
        transferCount = 0;
        penaltyCount = 0;
    }

    private void OnPerformanceError(string error)
    {
        Debug.LogError($"✗ Error: {error}");
        // Handle error in UI
    }

    private void OnDestroy()
    {
        if (blockchain != null)
        {
            blockchain.PerformanceRecorded -= OnPerformanceSuccess;
            blockchain.ErrorOccurred -= OnPerformanceError;
        }
    }
}
```

#### 3. Setup in Unity Scene

1. **Create an empty GameObject** named `BlockchainManager` in your scene
2. **Attach the `BlockchainManager.cs` script** to it
3. **Attach the `PerformanceRecorder.cs` script** to another GameObject (or the same one)
4. **Configure the API URL** in the BlockchainManager Inspector:
   - Set `apiBaseUrl` to: `https://k2surg-blockchain.vercel.app`
   - Set `requestTimeout` to: `30` seconds

#### 4. Example: Call Recording from User Input

```csharp
public class GameController : MonoBehaviour
{
    private PerformanceRecorder performanceRecorder;

    private void Start()
    {
        performanceRecorder = GetComponent<PerformanceRecorder>();
    }

    private void Update()
    {
        // Example: record performance on spacebar
        if (Input.GetKeyDown(KeyCode.Space))
        {
            performanceRecorder.AddScore(100);
            performanceRecorder.AddTransfer();
            performanceRecorder.SubmitPerformance();
        }
    }
}
```

---

## 📡 API Endpoint Details

### POST `/api/record`

**Description**: Record player performance and trigger reward logic

**Request Body**:
```json
{
  "score": 260,
  "transfers": 5,
  "penalties": 1
}
```

**Success Response (200)**:
```json
{
  "txHash": "0x123abc...",
  "event": {
    "user": "0xPlayer...",
    "score": "260",
    "minted": true
  },
  "blockNumber": 5123456
}
```

**Error Response (400/500)**:
```json
{
  "error": "Request body must include numeric score, transfers, and penalties."
}
```

### GET `/api/status`

**Description**: Get contract deployment status and configuration

**Response**:
```json
{
  "status": "ok",
  "contractAddress": "0xD5eAe2375D4cAb0cf2c5902fD73b927f25CdA7c4",
  "rewardThreshold": "250",
  "rewardNFT": "0xA19DC6E12e7C9cc023bE266b1C2AB4aEE64830aD"
}
```

### GET `/api/health`

**Description**: Check API availability

**Response**:
```json
{
  "status": "ok"
}
```

---

## 🔐 Security Considerations

### Current Security Measures
- CORS enabled for development (should be restricted in production)
- Environment variables stored securely in Vercel
- HTTPS enforced on Vercel deployment
- Input validation on all API endpoints

### Future Improvements
- Rate limiting (1 request per second per IP)
- Request signing with private key
- JWT authentication for premium features
- IP whitelist for sensitive endpoints

---

## 🐛 Troubleshooting

### Game doesn't connect to API
- **Check URL**: Ensure the API base URL is correct in Inspector
- **Test endpoint**: Visit https://k2surg-blockchain.vercel.app/api/health in browser
- **Check logs**: Look for CORS errors in browser developer console

### Transaction fails with "Missing environment variable"
- **Verify Vercel**: Check that `RPC_URL`, `PRIVATE_KEY`, and `CONTRACT_ADDRESS` are set in Vercel dashboard
- **Redeploy**: Changes to env vars require a Vercel redeploy

### NFT not minting even after successful recording
- **Check threshold**: Verify `rewardThreshold` in contract (currently: 250 points)
- **Verify contract**: Check that K2SurgRewardNFT contract is properly set as `rewardNFT` in K2SurgReward

### High latency or timeouts
- **Monitor transactions**: Gas prices on Sepolia may cause delays
- **Increase timeout**: Set `requestTimeout` higher in BlockchainManager

---

## 📊 Testing Checklist

Before going to production:
- [ ] Test API endpoints with Postman or curl
- [ ] Test all three transaction outcomes (success, low score, error)
- [ ] Verify NFT minting for qualifying scores
- [ ] Test network errors and timeout scenarios
- [ ] Verify dashboard updates after API calls
- [ ] Test on multiple devices (mobile + desktop)
- [ ] Review all error messages for user clarity

---

## 📚 Additional Resources

- **Ethereum Documentation**: https://ethereum.org/en/developers/
- **Solidity Docs**: https://docs.soliditylang.org/
- **Vercel Deployment**: https://vercel.com/docs
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Ethers.js**: https://docs.ethers.org/

---

## 🔄 Future Roadmap

```
Q2 2026: Unity Integration Complete
Q3 2026: Leaderboard & Analytics
Q4 2026: Multi-chain support
2027+: DAO governance & cross-game integration
```

---

## 📞 Support

For issues or questions:
1. Check the Vercel deployment logs
2. Review the dashboard at https://k2surg-blockchain.vercel.app/
3. Check contract status on Etherscan: https://sepolia.etherscan.io/
4. Review error logs in browser console (F12 → Console tab)

---

*Last Updated: April 17, 2026*  
*Project: K2Surg Blockchain VR Integration*
