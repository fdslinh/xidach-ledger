type SessionEntry = {
  profitLoss: number;
  player: {
    name: string;
  };
};

export function getSessionSummary(entries: SessionEntry[]) {
  const winners = entries.filter((entry) => entry.profitLoss > 0);
  const totalPositiveProfit = winners.reduce(
    (total, entry) => total + entry.profitLoss,
    0,
  );
  const biggestWinner = [...entries].sort(
    (a, b) => b.profitLoss - a.profitLoss,
  )[0];
  const biggestLoser = [...entries].sort(
    (a, b) => a.profitLoss - b.profitLoss,
  )[0];

  return {
    totalPositiveProfit,
    biggestWinner,
    biggestLoser,
  };
}
