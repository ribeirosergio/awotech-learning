import type { ProfileData } from '../lib/student-profile';

export default function StudentProfileFields({
  defaults = {},
  disabled = false,
}: {
  defaults?: Partial<Omit<ProfileData, 'birth_date'>> & {
    birth_date?: string | null;
  };
  disabled?: boolean;
}) {
  return (
    <fieldset className="profile-fields" disabled={disabled}>
      <legend>Dados do aluno</legend>
      <p className="profile-hint">
        Use o nome completo como deseja que apareça no certificado de conclusão.
        O e-mail é o da sua conta.
      </p>
      <div className="profile-grid">
        <label className="profile-wide">
          Nome completo
          <input
            name="full_name"
            autoComplete="name"
            minLength={3}
            maxLength={160}
            defaultValue={defaults.full_name ?? ''}
            required
          />
        </label>
        <label>
          Data de nascimento
          <input
            name="birth_date"
            type="date"
            autoComplete="bday"
            min="1900-01-01"
            max={new Date().toLocaleDateString('en-CA')}
            defaultValue={defaults.birth_date ?? ''}
            required
          />
        </label>
        <label>
          Telefone / WhatsApp
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={32}
            placeholder="(24) 99999-9999"
            defaultValue={defaults.phone ?? ''}
            required
          />
        </label>
        <label>
          País
          <input
            name="country"
            autoComplete="country-name"
            maxLength={100}
            defaultValue={defaults.country ?? 'Brasil'}
            required
          />
        </label>
        <label>
          Estado / região
          <input
            name="state"
            autoComplete="address-level1"
            maxLength={100}
            defaultValue={defaults.state ?? ''}
            required
          />
        </label>
        <label className="profile-wide">
          Cidade
          <input
            name="city"
            autoComplete="address-level2"
            maxLength={100}
            defaultValue={defaults.city ?? ''}
            required
          />
        </label>
        <label>
          Documento (opcional)
          <select
            name="document_type"
            defaultValue={defaults.document_type ?? ''}
          >
            <option value="">Não informar</option>
            <option>CPF</option>
            <option>RG</option>
            <option>Passaporte</option>
            <option>Outro</option>
          </select>
        </label>
        <label>
          Número do documento (opcional)
          <input
            name="document_number"
            maxLength={32}
            autoComplete="off"
            defaultValue={defaults.document_number ?? ''}
          />
        </label>
      </div>
      <p className="profile-hint">
        Os dados identificam o aluno e preparam o cadastro para a emissão do
        certificado. Informe um documento somente se desejar incluí-lo no
        cadastro.
      </p>
    </fieldset>
  );
}
