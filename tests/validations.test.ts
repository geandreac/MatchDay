import { validarCPF } from "@/lib/validations";

describe("MatchDay Utils", () => {
  describe("validarCPF", () => {
    it("rejeita CPF com todos dígitos iguais", () => {
      expect(validarCPF("11111111111")).toBe(false);
    });

    it("rejeita CPF com menos de 11 dígitos", () => {
      expect(validarCPF("123")).toBe(false);
    });

    it("aceita CPF válido (52998224725)", () => {
      expect(validarCPF("52998224725")).toBe(true);
    });

    it("aceita CPF com formatação", () => {
      expect(validarCPF("529.982.247-25")).toBe(true);
    });

    it("rejeita CPF inválido", () => {
      expect(validarCPF("12345678901")).toBe(false);
    });
  });
});
