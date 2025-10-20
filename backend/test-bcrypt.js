import bcrypt from 'bcryptjs';

const senhaPura = '1234Mudar@';

// ⚠️ substitui abaixo pelo valor EXATO que está no banco na coluna senha_hash
const hashBanco = '$2a$12$sgQFZtOufzO2bXY9YayxDmO2HnMTUR0A8cRpnm1SgsJkaLO2hJCSW';

const testar = async () => {
  const resultado = await bcrypt.compare(senhaPura, hashBanco);
  console.log('Resultado do bcrypt.compare:', resultado ? '✅ TRUE' : '❌ FALSE');
};

testar();
