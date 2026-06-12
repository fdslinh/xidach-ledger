export type SettlementPlayer = {
  player: {
    name: string;
  };
  profitLoss: number;
};

export type Settlement = {
  fromPlayer: string;
  toPlayer: string;
  amount: number;
};

export function calculateSettlements(players: SettlementPlayer[]) {
  const totalProfitLoss = players.reduce(
    (total, player) => total + player.profitLoss,
    0,
  );

  if (totalProfitLoss !== 0) {
    return {
      isBalanced: false,
      totalProfitLoss,
      settlements: [] satisfies Settlement[],
    };
  }

  const payers = players
    .filter((player) => player.profitLoss < 0)
    .map((player) => ({
      name: player.player.name,
      remaining: Math.abs(player.profitLoss),
    }));
  const receivers = players
    .filter((player) => player.profitLoss > 0)
    .map((player) => ({
      name: player.player.name,
      remaining: player.profitLoss,
    }));
  const settlements: Settlement[] = [];
  let payerIndex = 0;
  let receiverIndex = 0;

  while (payerIndex < payers.length && receiverIndex < receivers.length) {
    const payer = payers[payerIndex];
    const receiver = receivers[receiverIndex];
    const amount = Math.min(payer.remaining, receiver.remaining);

    settlements.push({
      fromPlayer: payer.name,
      toPlayer: receiver.name,
      amount,
    });

    payer.remaining -= amount;
    receiver.remaining -= amount;

    if (payer.remaining === 0) {
      payerIndex += 1;
    }

    if (receiver.remaining === 0) {
      receiverIndex += 1;
    }
  }

  return {
    isBalanced: true,
    totalProfitLoss,
    settlements,
  };
}
