import Link from "next/link";

export default function Privacidade() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-lg px-5 py-8 space-y-6">
        <Link href="/menu" className="text-sm text-primary hover:underline">&larr; Voltar</Link>
        <h1 className="text-2xl font-bold text-text">Política de Privacidade</h1>
        <div className="text-sm text-text-2 space-y-4 leading-relaxed">
          <p>Sua privacidade é importante para nós.</p>
          <h2 className="text-base font-semibold text-text">1. Dados Coletados</h2>
          <p>Coletamos nome, CPF, email, data de nascimento e dados de pagamento necessários para o funcionamento da plataforma.</p>
          <h2 className="text-base font-semibold text-text">2. Uso dos Dados</h2>
          <p>Seus dados são utilizados exclusivamente para autenticação, processamento de pagamentos e melhoria do serviço.</p>
          <h2 className="text-base font-semibold text-text">3. Armazenamento</h2>
          <p>Seus dados são armazenados de forma segura em servidores na nuvem.</p>
          <h2 className="text-base font-semibold text-text">4. Contato</h2>
          <p>Para solicitar exclusão de dados ou tirar dúvidas, entre em contato pelo email de suporte.</p>
        </div>
      </div>
    </div>
  );
}
