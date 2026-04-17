# k2surg-blockchain
3layes- metaverse -blockchain -AI-Model(NFT and Smart Contracts)

## Local deployment

1. Install dependencies:

```bash
npm install
```

2. Start Hardhat localhost in one terminal:

```bash
npx hardhat node
```

3. In another terminal, run the deploy script:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

4. Or use the npm shortcut:

```bash
npm run deploy:localhost
```

## Vercel deployment

1. Create a Vercel project for this repository.
2. Add these environment variables in Vercel project settings:
   - `RPC_URL` (public RPC endpoint for the chain)
   - `PRIVATE_KEY` (wallet private key used by the backend)
   - `CONTRACT_ADDRESS` (deployed `K2SurgReward` address)
3. Deploy to Vercel.

The API endpoints will be:
- `GET /api/health`
- `GET /api/status`
- `POST /api/performance`
- `POST /api/record` (alias for `/api/performance`)

The landing page is available at the project root:
- `https://<your-vercel-app>.vercel.app`

## Network and env values

- `RPC_URL`: public RPC endpoint for the network your contract is deployed on.
  - Example for Sepolia: `https://eth-sepolia.g.alchemy.com/v2/<your-key>`
  - Example for Polygon Mumbai: `https://polygon-mumbai.g.alchemy.com/v2/<your-key>`
- `PRIVATE_KEY`: the private key of the wallet that will sign contract calls.
  - Keep this secret and never commit it.
  - On Vercel, set it only in environment variables.
- `CONTRACT_ADDRESS`: the deployed address of `K2SurgReward` on the selected network.
  - This comes from your deployment output.

## Deploying your contract to a public testnet

1. Get a provider key from Alchemy, Infura, or QuickNode.
2. Set `RPC_URL` to the chain endpoint you want to use.
3. Set `PRIVATE_KEY` to the deployer wallet private key.
4. Run one of these commands depending on your target network:
   - `npm run deploy:sepolia`
   - `npm run deploy:mumbai`
5. Copy the deployed `K2SurgReward` address into Vercel `CONTRACT_ADDRESS`.

## Vercel environment variable setup

Use the Vercel dashboard or CLI to add these values for your project:
- `RPC_URL`: your public testnet RPC endpoint
- `PRIVATE_KEY`: your deployer account private key
- `CONTRACT_ADDRESS`: address returned by deployment

If you are using the Vercel CLI, you can also run:
```bash
vercel env add RPC_URL production
vercel env add PRIVATE_KEY production
vercel env add CONTRACT_ADDRESS production
```

## Unity integration

Open your Unity VR project and use this endpoint:
```csharp
string url = "https://your-vercel-app.vercel.app/api/record";
```

This repo also includes a Vercel landing page at the root URL to verify connectivity and contract status.

## Best practice

- For development, compile contracts locally when you change them.
- For Vercel, you only need to redeploy the backend when you change API code or ABI files.
- If contract code changes, recompile locally and update `abis/K2SurgReward.json` and `CONTRACT_ADDRESS` if redeploying.
- If you want a VR user flow, you can use a Unity button/UI to start a session rather than a web landing page.
- A landing page is optional. The core flow is:
  Unity VR → POST to Vercel API → blockchain call → mint NFT.

## Notes

- Vercel cannot use your local `http://127.0.0.1:8545` RPC endpoint.
- On Vercel, use a public RPC provider endpoint instead.

## Unity integration

Use the Vercel URL as the endpoint. Example Unity code:

```csharp
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class BlockchainConnector : MonoBehaviour
{
    string url = "https://your-vercel-app.vercel.app/api/record";

    public void SendPerformance(int score, int transfers, int penalties)
    {
        StartCoroutine(PostData(score, transfers, penalties));
    }

    IEnumerator PostData(int score, int transfers, int penalties)
    {
        string json = "{\"score\":" + score +
                      ",\"transfers\":" + transfers +
                      ",\"penalties\":" + penalties + "}";

        UnityWebRequest request = new UnityWebRequest(url, "POST");
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        Debug.Log(request.downloadHandler.text);
    }
}
```
