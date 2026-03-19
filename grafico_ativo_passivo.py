import matplotlib.pyplot as plt

# Dados extraídos do balanço
anos = ['2023', '2024']
ativo = [31188199.47, 10844216.25]
passivo = [31188199.47, 10844216.25]

# Criar o gráfico de barras
x = range(len(anos))
plt.bar(x, ativo, width=0.4, label='Ativo', align='center', color='blue')
plt.bar([i + 0.4 for i in x], passivo, width=0.4, label='Passivo', align='center', color='orange')

# Configurações do gráfico
plt.xlabel('Ano')
plt.ylabel('Valores (R$)')
plt.title('Comparação de Ativo e Passivo')
plt.xticks([i + 0.2 for i in x], anos)
plt.legend()

# Exibir o gráfico
plt.tight_layout()
plt.show()