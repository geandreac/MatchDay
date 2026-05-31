export function validarCPF(cpf: string): boolean {
  const numeros = cpf.replace(/\D/g, "");

  if (numeros.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numeros)) return false;

  const calcDigito = (slice: string, fator: number) => {
    let soma = 0;
    for (const digito of slice) {
      soma += parseInt(digito) * fator--;
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const dig1 = calcDigito(numeros.slice(0, 9), 10);
  if (dig1 !== parseInt(numeros[9])) return false;

  const dig2 = calcDigito(numeros.slice(0, 10), 11);
  if (dig2 !== parseInt(numeros[10])) return false;

  return true;
}

export function formatarCPF(cpf: string): string {
  const nums = cpf.replace(/\D/g, "");
  if (nums.length !== 11) return cpf;
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
}

export function validarIdade(birthDate: Date): { valido: boolean; mensagem: string } {
  const hoje = new Date();
  let idade = hoje.getFullYear() - birthDate.getFullYear();
  const mes = hoje.getMonth() - birthDate.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < birthDate.getDate())) {
    idade--;
  }
  if (idade < 18) {
    return { valido: false, mensagem: "É necessário ter pelo menos 18 anos para se cadastrar." };
  }
  return { valido: true, mensagem: "" };
}

export function validarSenha(senha: string): { valido: boolean; mensagem: string } {
  if (senha.length < 8) {
    return { valido: false, mensagem: "A senha deve ter pelo menos 8 caracteres." };
  }
  if (!/[A-Z]/.test(senha)) {
    return { valido: false, mensagem: "A senha deve conter pelo menos uma letra maiúscula." };
  }
  if (!/[a-z]/.test(senha)) {
    return { valido: false, mensagem: "A senha deve conter pelo menos uma letra minúscula." };
  }
  if (!/[0-9]/.test(senha)) {
    return { valido: false, mensagem: "A senha deve conter pelo menos um número." };
  }
  return { valido: true, mensagem: "" };
}

export function formatarData(data: Date): string {
  const dias = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  const diaSemana = dias[data.getDay()];
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = meses[data.getMonth()];
  const ano = data.getFullYear();
  return `${diaSemana}, ${dia} de ${mes} de ${ano}`;
}
