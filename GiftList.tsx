"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Gift = { id: number; name: string; category: string; guestName: string | null };

const meta: Record<string, [string, string]> = {
  cozinha: ["🍲", "Cozinha"],
  mesa: ["🍽️", "Mesa"],
  cama: ["🛏️", "Cama"],
  banho: ["🧺", "Banho"],
};

export default function GiftList() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [filter, setFilter] = useState("todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Gift | null>(null);
  const [guest, setGuest] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const response = await fetch("/api/gifts", { cache: "no-store" });
      if (!response.ok) throw new Error();
      setGifts(await response.json());
    } catch {
      setNotice("Não foi possível atualizar a lista agora.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  const shown = useMemo(
    () =>
      gifts.filter(
        (gift) =>
          (filter === "todos" || gift.category === filter) &&
          gift.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [gifts, filter, query],
  );
  const reserved = gifts.filter((gift) => gift.guestName).length;

  async function reserve(event: FormEvent) {
    event.preventDefault();
    if (!selected || guest.trim().length < 2) return;
    setSaving(true);
    const response = await fetch("/api/gifts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ giftId: selected.id, guestName: guest.trim() }),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setNotice(data.error || "Não foi possível reservar este presente.");
      await load();
      return;
    }
    setNotice(`Que carinho! ${data.name} ficou reservado para você.`);
    setSelected(null);
    setGuest("");
    await load();
  }

  return (
    <main>
      <header className="hero">
        <img className="hero-photo" src="/casal-parque-1.webp" alt="O casal sorrindo junto em um parque de diversões" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <span className="eyebrow light">PARA O NOSSO NOVO LAR</span>
          <h1>Lista de <em>Presentes</em></h1>
          <p>Escolha um presente e nos ajude a construir nosso cantinho com muito amor.</p>
          <a className="hero-cta" href="#presentes">Escolher um presente <span>↓</span></a>
        </div>
      </header>

      <section className="our-story" aria-label="Um pouco sobre nós">
        <div className="story-copy">
          <span className="eyebrow">UM POUQUINHO DE NÓS</span>
          <h2>Dois corações, muitos planos e um novo lar.</h2>
          <p>Estamos começando um capítulo muito especial. Ter vocês por perto torna cada detalhe dessa nova história ainda mais bonito.</p>
          <div className="signature">Com carinho, nós dois ♡</div>
        </div>
        <div className="photo-stack" aria-label="Fotos do casal">
          <figure className="photo-card photo-card-one"><img src="/casal-parque-2.webp" alt="O casal rindo junto" /></figure>
          <figure className="photo-card photo-card-two"><img src="/casal-parque-3.webp" alt="O casal de mãos dadas" /></figure>
          <span className="photo-heart" aria-hidden="true">♥</span>
        </div>
      </section>

      <section className="content" id="presentes">
        <div className="section-heading">
          <span className="eyebrow">ESCOLHA COM CARINHO</span>
          <h2>Presentes para o nosso cantinho</h2>
          <p>Cada item só pode ser escolhido uma vez.</p>
        </div>

        <div className="gift-summary">
          <div className="progress-label"><span>{gifts.length - reserved} disponíveis</span><b>{reserved} escolhidos</b></div>
          <div className="progress" aria-label={`${reserved} presentes escolhidos`}><i style={{ width: gifts.length ? `${(reserved / gifts.length) * 100}%` : "0%" }} /></div>
        </div>

        <div className="toolbar">
          <div className="filters" role="group" aria-label="Filtrar presentes">
            {["todos", "cozinha", "mesa", "cama", "banho"].map((key) => (
              <button key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>
                {key === "todos" ? "Todos" : `${meta[key][0]} ${meta[key][1]}`}
              </button>
            ))}
          </div>
          <input aria-label="Buscar presente" placeholder="⌕  Buscar presente" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>

        {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Fechar aviso">×</button></div>}

        {loading ? <div className="empty">Preparando a lista com carinho…</div> : (
          <div className="grid">
            {shown.map((gift) => (
              <article key={gift.id} className={gift.guestName ? "card reserved" : "card"}>
                <div className={`icon ${gift.category}`}>{meta[gift.category]?.[0] || "🎁"}</div>
                <div className="copy"><small>{meta[gift.category]?.[1] || gift.category}</small><h3>{gift.name}</h3>{gift.guestName && <p>♥ Presente de {gift.guestName}</p>}</div>
                {gift.guestName ? <span className="status">Escolhido</span> : <button onClick={() => setSelected(gift)}>Quero presentear</button>}
              </article>
            ))}
          </div>
        )}
      </section>

      <footer><span>♡</span><p>Cada presente será recebido<br /><em>com muito carinho!</em></p><span>♡</span></footer>

      {selected && (
        <div className="backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="gift-title">
            <button className="close" onClick={() => setSelected(null)} aria-label="Fechar">×</button>
            <div className="big">{meta[selected.category]?.[0] || "🎁"}</div>
            <span className="eyebrow">UMA LINDA ESCOLHA</span>
            <h2 id="gift-title">{selected.name}</h2>
            <p>Digite seu nome para reservar. Ele ficará visível para todos.</p>
            <form onSubmit={reserve}>
              <label>Seu nome<input autoFocus required minLength={2} maxLength={60} value={guest} onChange={(event) => setGuest(event.target.value)} placeholder="Como você quer aparecer?" /></label>
              <button disabled={saving}>{saving ? "Reservando…" : "Confirmar presente ♥"}</button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
