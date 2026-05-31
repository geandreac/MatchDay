import { validarCPF, validarSenha, validarIdade, formatarCPF } from "@/lib/validations";

describe("validarSenha", () => {
  it("rejeita senha menor que 8 caracteres", () => {
    expect(validarSenha("Ab1").valido).toBe(false);
  });

  it("rejeita senha sem maiuscula", () => {
    expect(validarSenha("abcdefg1").valido).toBe(false);
  });

  it("rejeita senha sem minuscula", () => {
    expect(validarSenha("ABCDEFG1").valido).toBe(false);
  });

  it("rejeita senha sem numero", () => {
    expect(validarSenha("Abcdefgh").valido).toBe(false);
  });

  it("aceita senha valida", () => {
    expect(validarSenha("Abcdefg1").valido).toBe(true);
  });
});

describe("validarIdade", () => {
  it("rejeita menor de 18 anos", () => {
    const data = new Date();
    data.setFullYear(data.getFullYear() - 17);
    expect(validarIdade(data).valido).toBe(false);
  });

  it("aceita maior de 18 anos", () => {
    const data = new Date();
    data.setFullYear(data.getFullYear() - 25);
    expect(validarIdade(data).valido).toBe(true);
  });
});

describe("formatarCPF", () => {
  it("formata CPF corretamente", () => {
    expect(formatarCPF("52998224725")).toBe("529.982.247-25");
  });
});

describe("validarCPF", () => {
  it("rejeita CPF com todos digitos iguais", () => {
    expect(validarCPF("11111111111")).toBe(false);
  });

  it("rejeita CPF com menos de 11 digitos", () => {
    expect(validarCPF("123")).toBe(false);
  });

  it("aceita CPF valido", () => {
    expect(validarCPF("52998224725")).toBe(true);
  });

  it("aceita CPF com formatacao", () => {
    expect(validarCPF("529.982.247-25")).toBe(true);
  });

  it("rejeita CPF invalido", () => {
    expect(validarCPF("12345678901")).toBe(false);
  });
});
