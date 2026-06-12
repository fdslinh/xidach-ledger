Build a personal web app called "Xì Dách Ledger".

Tech stack:
- Next.js
- TypeScript
- Prisma
- SQLite for local development
- Tailwind CSS
- shadcn/ui if available

Main goal:
The app helps a group of friends record blackjack/xì dách game sessions and calculate each player’s profit/loss.

Data model:
1. Player
   - id
   - name
   - isActive
   - createdAt
   - updatedAt

2. GameSession
   - id
   - playedAt
   - note
   - createdAt
   - updatedAt

3. GameSessionPlayer
   - id
   - gameSessionId
   - playerId
   - startAmount
   - endAmount
   - profitLoss
   - createdAt
   - updatedAt

Rules:
- profitLoss = endAmount - startAmount
- When saving a session, the sum of all profitLoss values must equal 0
- If the total is not 0, block saving and show the difference
- Amounts should be stored as integers in VND

Pages:
1. /players
   - List all players
   - Add new player
   - Edit player name
   - Deactivate player

2. /sessions
   - List all game sessions
   - Show played date, number of players, total positive profit, biggest winner, biggest loser

3. /sessions/new
   - Select active players
   - For each selected player, input startAmount and endAmount
   - Auto-calculate profitLoss
   - Show total difference
   - Allow saving only if total profit/loss equals 0

4. /sessions/[id]
   - Show session detail
   - Show each player’s startAmount, endAmount, profitLoss
   - Highlight winners and losers

5. /ranking
   - Show all-time ranking
   - Columns:
     - Player
     - Total profit/loss
     - Sessions played
     - Win count
     - Loss count
     - Win rate
     - Average profit/loss per session
     - Biggest win
     - Biggest loss

Implementation requirements:
- Use server actions or API routes for CRUD operations
- Use Prisma migrations
- Format money as VND
- Validate inputs
- Prevent saving sessions with fewer than 2 players
- Prevent negative startAmount or endAmount
- Add basic responsive UI for mobile