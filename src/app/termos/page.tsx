import Link from "next/link";

export default function Termos() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-lg px-5 py-8 space-y-6">
        <Link href="/menu" className="text-sm text-primary hover:underline">&larr; Voltar</Link>
        <h1 className="text-2xl font-bold text-text">Termos de Uso</h1>
        <div className="text-sm text-text-2 space-y-4 leading-relaxed">
          <p>Ao utilizar o MatchDay, você concorda com os seguintes termos.</p>
          <h2 className="text-base font-semibold text-text">1. Serviço</h2>
          <p>O MatchDay é uma plataforma que conecta jogadores a campos de futebol, permitindo agendamento e pagamento compartilhado.</p>
          <h2 className="text-base font-semibold text-text">2. Taxa</h2>
          <p>O MatchDay cobra uma taxa de 5% sobre o valor total de cada reserva, referente à comissão da plataforma.</p>
          <h2 className="text-base font-semibold text-text">3. Cancelamento</h2>
          <p>Reservas podem ser canceladas desde que não haja pagamentos confirmados. Pagamentos realizados são processados conforme a regra de 48h.</p>
          <h2 className="text-base font-semibold text-text">4. Responsabilidades</h2>
          <p>O MatchDay é apenas uma plataforma de intermediação. A responsabilidade pela qualidade do campo e pela realização da partida é do dono do campo e dos jogadores.</p>
        </div>
      </div>
    </div>
  );
}
