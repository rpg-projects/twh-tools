import { useState, useMemo } from "react";

type OnSelectFn = (
  nomePericia: string,
  atributoAlternativo?: string | null
) => string;

interface ModalSimularDadosProps {
  open: boolean;
  onClose: () => void;
  pericias?: Record<string, any>;
  atributos?: Record<string, any>;
  onSelect: OnSelectFn;
}

export function ModalSimularDados({
  open,
  onClose,
  pericias,
  atributos,
  onSelect,
}: ModalSimularDadosProps) {
  const [query, setQuery] = useState("");
  const [resultado, setResultado] = useState("");
  const [showList, setShowList] = useState(true);
  const [atributoAlternativo, setAtributoAlternativo] = useState("");

  const listaPericias = useMemo(() => {
    if (!pericias) return [];
    return Object.keys(pericias);
  }, [pericias]);

  const listaAtributos = useMemo(() => {
    if (!atributos) return [];
    return Object.keys(atributos);
  }, [atributos]);

  const filtradas = useMemo(() => {
    if (!query) return listaPericias;
    return listaPericias.filter((p) =>
      p.toLowerCase().startsWith(query.toLowerCase())
    );
  }, [query, listaPericias]);

  if (!open) return null;

  function fecharModal() {
    // 🧹 LIMPA TUDO AO FECHAR
    setQuery("");
    setAtributoAlternativo("");
    setResultado("");
    setShowList(true);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Calcular dados base</h2>

        {/* INPUT DA PERÍCIA */}
        <input
          autoFocus
          type="text"
          className="w-full px-3 py-2 border rounded-lg mb-3"
          placeholder="Digite o nome da perícia..."
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setShowList(true);

            if (val.trim() === "") {
              setResultado("");
              setAtributoAlternativo("");
            }
          }}
        />

        {/* LISTA DE PERÍCIAS */}
        {showList && (
          <div className="max-h-56 overflow-y-auto border rounded-lg">
            {filtradas.length === 0 && (
              <p className="text-sm p-3 text-gray-500">
                Nenhuma perícia encontrada
              </p>
            )}

            {filtradas.map((p) => (
              <button
                key={p}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 transition"
                onClick={() => {
                  setQuery(p);
                  setShowList(false);
                  setAtributoAlternativo("");
                  const r = onSelect(p, null);
                  setResultado(r);
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* SE PERÍCIA FOI SELECIONADA → MOSTRA SELECT DO ATRIBUTO */}
        {!showList && query && (
          <div className="mt-4">
            <p className="text-sm mb-1 text-gray-600">
              Calcular com atributo alternativo (opcional):
            </p>

            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={atributoAlternativo}
              onChange={(e) => {
                const escolha = e.target.value;
                setAtributoAlternativo(escolha);

                // chama o cálculo sempre que mudar o atributo alternativo
                const r = onSelect(query, escolha || null);
                setResultado(r);
              }}
            >
              <option value="">Atributo alternativo</option>
              {listaAtributos.map((attr) => (
                <option key={attr} value={attr}>
                  {attr}
                </option>
              ))}
            </select>
          </div>
        )}

        {resultado && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
            <span className="whitespace-pre-wrap text-gray-800">
              {resultado}
            </span>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
            onClick={fecharModal}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
