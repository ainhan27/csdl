import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, ClipboardList,
  Database, FileText, GraduationCap, House, Layers3, Menu, Moon, Network, RotateCcw, Search,
  Shuffle, Sun, Target, Terminal, X,
} from 'lucide-react';
import c1 from './content/chapter-1.json';
import c2 from './content/chapter-2.json';
import c3 from './content/chapter-3.json';
import c4 from './content/chapter-4.json';
import c5 from './content/chapter-5.json';
import { emptyProgress, grade, normalize, recordAttempt, reviewQueue, shuffled } from './study.js';
import './style.css';

const chapters = [c1, c2, c3, c4, c5];
const questions = chapters.flatMap(chapter => chapter.questions);
const icons = [Database, Network, Layers3, Terminal, ClipboardList];
const tabs = [['theory', 'Lý thuyết', BookOpen], ['terms', 'Từ vựng', FileText], ['quiz', 'Trắc nghiệm', Target], ['cases', 'Case Study', ClipboardList]];
const letters = 'ABCD';
const storageKey = 'mis2001-study-v1';
const chapterUrl = (id, tab = 'theory') => '#/chuong/' + id + '/' + tab;

function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; }
    catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* Continue with in-memory state when storage is unavailable. */ }
  }, [key, value]);
  return [value, setValue];
}

function App() {
  const [hash, setHash] = useState(location.hash);
  const [theme, setTheme] = useStored('mis2001-theme', 'light');
  const [progress, setProgress] = useStored(storageKey, emptyProgress);
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const [searchSelection, setSearchSelection] = useState(0);
  const [, section, id, tab, targetId] = hash.slice(1).split('/');
  const chapter = section === 'chuong' ? chapters.find(item => item.id === Number(id)) : null;
  const reviewing = section === 'luyen-lai';
  const wrong = reviewQueue(questions, progress.attempts);

  useEffect(() => {
    const onHash = () => {
      setHash(location.hash);
      setMenu(false);
      if (!location.hash.split('/')[4]) window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    function onKey(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearch(value => !value);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (!targetId || hash !== location.hash) return;
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (target) {
        if (target instanceof HTMLDetailsElement) target.open = true;
        target.scrollIntoView({ block: 'start' });
        target.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, searchSelection, targetId]);

  return <div className="shell">
    {menu && <button className="mobile-scrim" aria-label="Đóng menu" onClick={() => setMenu(false)} />}
    <aside className={'sidebar' + (menu ? ' open' : '')}>
      <a className="brand" href="#/" onClick={() => setMenu(false)}>
        <span className="brand-icon"><Database size={23} /></span>
        <span><strong>MIS<span>2001</span></strong><small>CƠ SỞ DỮ LIỆU</small></span>
      </a>
      <nav aria-label="Điều hướng chính">
        <p className="nav-label">HỌC TẬP</p>
        <a className={'nav-item ' + (!chapter && !reviewing ? 'active' : '')} href="#/" onClick={() => setMenu(false)}><House size={18} /> Tổng quan</a>
        <a className={'nav-item ' + (reviewing ? 'active' : '')} href="#/luyen-lai" onClick={() => setMenu(false)}><RotateCcw size={18} /> Luyện câu sai {wrong.length > 0 && <span className="side-count">{wrong.length}</span>}</a>
        <p className="nav-label chapter-label">CHƯƠNG HỌC</p>
        {chapters.map((item, index) => <a key={item.id} className={'nav-item nav-chapter ' + (chapter?.id === item.id ? 'active' : '')} href={chapterUrl(item.id)} onClick={() => setMenu(false)}>
          <span className={'nav-number tone-' + item.id}>{String(index + 1).padStart(2, '0')}</span>
          <span>{['Tổng quan CSDL', 'Thiết kế & mô hình ER', 'Phụ thuộc hàm & chuẩn hóa', 'Truy vấn SQL', 'Big Data & NoSQL'][index]}</span>
        </a>)}
      </nav>
      <div className="sidebar-bottom"><GraduationCap size={19} /><div><strong>Ôn thi cuối kỳ</strong><small>Học phần MIS2001</small></div></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div className="crumb"><button className="icon-button mobile-menu" aria-label={menu ? "Đóng menu" : "Mở menu"} aria-expanded={menu} onClick={() => setMenu(!menu)}><Menu size={21} /></button><span className="crumb-root">Học tập</span><ChevronRight className="crumb-root" size={15} /><strong>{chapter ? 'Chương ' + chapter.id : reviewing ? 'Luyện câu sai' : 'Tổng quan'}</strong></div>
        <div className="top-actions">
          <button className="search-button" aria-label="Tìm câu hỏi, thuật ngữ" onClick={() => setSearch(true)}><Search size={17} /><span>Tìm câu hỏi, thuật ngữ...</span><kbd>Ctrl K</kbd></button>
          <button className="icon-button" aria-label={theme === 'dark' ? 'Bật giao diện sáng' : 'Bật giao diện tối'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button>
        </div>
      </header>
      <main className="main">
        {chapter ? <Chapter key={chapter.id} chapter={chapter} tab={tabs.some(([name]) => name === tab) ? tab : 'theory'} progress={progress} setProgress={setProgress} />
          : reviewing ? <Review wrong={wrong} setProgress={setProgress} />
          : <Dashboard progress={progress} />}
        <footer><span>MIS2001 · Cơ sở dữ liệu</span><span>Tiến độ lưu trên thiết bị này</span></footer>
      </main>
    </div>
    {search && <SearchDialog close={() => setSearch(false)} openResult={(url, target) => {
      setSearch(false);
      setSearchSelection(value => value + 1);
      location.hash = url + '/' + target;
    }} />}
  </div>;
}

function Dashboard({ progress }) {
  const completed = chapters.filter(chapter => progress.completed[chapter.id]).length;
  const next = chapters.find(chapter => !progress.completed[chapter.id]) ?? chapters[0];
  const practiced = questions.filter(question => progress.attempts[question.id]).length;

  return <>
    <div className="hero">
      <div className="hero-copy">
        <span className="hero-tag"><GraduationCap size={17} /> HỌC PHẦN MIS2001</span>
        <h1>Ôn tập cuối kỳ<br /><em>Cơ sở dữ liệu</em></h1>
        <p>Hệ thống kiến thức, luyện trắc nghiệm và vận dụng qua các tình huống thực tế.</p>
        <a className="primary-button" href={chapterUrl(next.id)}>{completed || practiced ? 'Tiếp tục học' : 'Bắt đầu học'} <ArrowRight size={17} /></a>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="diagram-node node-a"><Database size={35} /></div>
        <div className="diagram-node node-b"><Network size={28} /></div>
        <div className="diagram-node node-c"><Terminal size={24} /></div>
        <div className="diagram-node node-d"><Layers3 size={26} /></div>
        <i className="connector connector-a" /><i className="connector connector-b" /><i className="connector connector-c" />
        <span className="diagram-spark spark-a">+</span><span className="diagram-spark spark-b">+</span><span className="diagram-spark spark-c">+</span>
      </div>
    </div>
    <div className="stats">
      <Stat icon={BookOpen} tone={1} label="Chương học" value={chapters.length} />
      <Stat icon={ClipboardList} tone={2} label="Câu trắc nghiệm" value={questions.length} hint={practiced ? `Đã luyện ${practiced} câu` : undefined} />
      <Stat icon={Target} tone={3} label="Tiến độ học" value={completed + '/' + chapters.length} hint="chương hoàn thành" progress={completed / chapters.length * 100} />
    </div>
    <section id="chuong-hoc">
      <div className="section-heading"><div><h2>Chương học</h2><p>Chọn một chương để bắt đầu ôn tập.</p></div><span className="chapter-count"><ArrowDown size={15} /> {chapters.length} chương</span></div>
      <div className="chapter-grid">
        {chapters.map(chapter => {
          const Icon = icons[chapter.id - 1];
          return <a className="chapter-card" key={chapter.id} href={chapterUrl(chapter.id)}>
            <div className="card-top"><span className={'tile-icon tone-' + chapter.id}><Icon size={22} /></span><span className="card-index">CHƯƠNG {String(chapter.id).padStart(2, '0')}</span></div>
            <h3>{chapter.title}</h3><p>{chapter.description}</p>
            <div className="card-bottom"><span>{progress.completed[chapter.id] ? <><Check size={15} /> Đã hoàn thành</> : chapter.questions.length ? <><ClipboardList size={15} /> {chapter.questions.length} câu hỏi</> : <><ClipboardList size={15} /> {chapter.cases.length} câu tự luận</>}</span><ChevronRight size={19} /></div>
          </a>;
        })}
      </div>
    </section>
  </>;
}

function Stat({ icon: Icon, tone, label, value, hint, progress }) {
  return <div className="stat"><span className={'tile-icon tone-' + tone}><Icon size={21} /></span><div className="stat-content"><span>{label}</span><div className="stat-line"><strong>{value}</strong>{hint && <small>{hint}</small>}</div>{progress !== undefined && <progress value={progress} max="100" aria-label="Tiến độ học" />}</div></div>;
}

function Chapter({ chapter, tab, progress, setProgress }) {
  const Icon = icons[chapter.id - 1];
  const complete = Boolean(progress.completed[chapter.id]);
  function toggleComplete() {
    setProgress(previous => ({ ...previous, completed: { ...previous.completed, [chapter.id]: !previous.completed[chapter.id] } }));
  }
  return <>
    <a className="back-link" href="#/"><ArrowLeft size={16} /> Tổng quan</a>
    <div className="chapter-banner">
      <span className={'tile-icon tone-' + chapter.id}><Icon size={27} /></span>
      <div><span className="card-index">CHƯƠNG {String(chapter.id).padStart(2, '0')}</span><h1>{chapter.title}</h1><p>{chapter.description}</p></div>
      <button className={'outline-button ' + (complete ? 'marked' : '')} aria-pressed={complete} onClick={toggleComplete}><Check size={17} /> {complete ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</button>
    </div>
    <nav className="tabs" aria-label="Nội dung chương">
      {tabs.map(([value, label, TabIcon]) => <a key={value} href={chapterUrl(chapter.id, value)} aria-current={tab === value ? 'page' : undefined}><TabIcon size={17} /> {label}</a>)}
    </nav>
    {tab === 'theory' && <section className="reading"><h2>Lý thuyết trọng tâm</h2><p className="muted">Tóm tắt bổ sung theo chủ đề của chương.</p>
      {chapter.theory.map(({ title, text }, index) => <article className="reading-card" key={title}><span className={'tile-icon tone-' + chapter.id}>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}
    </section>}
    {tab === 'terms' && <section className="reading"><h2>Từ vựng chuyên ngành</h2><p className="muted">Chú giải bổ sung cho các thuật ngữ của chương.</p>
      {chapter.terms.map(({ term, english, definition }, index) => <article className="reading-card" key={term} id={'term-' + chapter.id + '-' + index} tabIndex={-1}><span className={'tile-icon tone-' + chapter.id}><FileText size={20} /></span><div><h3>{term} <small>· {english}</small></h3><p>{definition}</p></div></article>)}
    </section>}
    {tab === 'quiz' && (chapter.questions.length ? <Quiz key={chapter.id} pool={chapter.questions} setProgress={setProgress} showBank /> : <div className="empty"><ClipboardList size={35} /><h2>Chương này có {chapter.cases.length} câu tự luận</h2><p>Mở Case Study để xem đề và lưu bài làm.</p><a className="primary-button" href={chapterUrl(chapter.id, 'cases')}>Mở Case Study <ArrowRight size={16} /></a></div>)}
    {tab === 'cases' && <section className="reading"><h2>Bài tập tình huống</h2>
      {chapter.cases.map(item => <article className="case-card" key={item.id} id={item.id} tabIndex={-1}>
        <span className="pill">{item.supplemental ? 'Bài tập bổ sung' : 'Tự luận · Câu ' + item.number}</span><h3>{item.title}</h3>
        {item.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        <label htmlFor={'draft-' + item.id}>Bài làm của bạn</label><textarea id={'draft-' + item.id} placeholder="Nhập ghi chú hoặc bài giải..." value={progress.drafts[item.id] ?? ''} onChange={event => {
          const value = event.target.value;
          setProgress(previous => ({ ...previous, drafts: { ...previous.drafts, [item.id]: value } }));
        }} />
      </article>)}
    </section>}
  </>;
}

function Review({ wrong, setProgress }) {
  const [session, setSession] = useState(null);
  return <>
    <a className="back-link" href="#/"><ArrowLeft size={16} /> Tổng quan</a>
    <div className="section-heading"><div><h1>Luyện câu sai</h1><p>Ôn lại các câu đã chấm mà bạn trả lời sai.</p></div></div>
    {session ? <Quiz pool={session} setProgress={setProgress} onExit={() => setSession(null)} />
      : <div className="empty"><RotateCcw size={34} />
        <h2>{wrong.length ? wrong.length + ' câu cần luyện lại' : 'Chưa có câu sai đã xác nhận'}</h2>
        <p>{wrong.length ? 'Trả lời đúng để loại câu khỏi danh sách.' : 'Câu cần kiểm chứng sẽ không được tính là câu sai.'}</p>
        {wrong.length > 0 && <button className="primary-button" onClick={() => setSession(wrong)}>Bắt đầu luyện lại <ArrowRight size={16} /></button>}
      </div>}
  </>;
}

function Quiz({ pool, setProgress, showBank, onExit }) {
  const [items, setItems] = useState(pool);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [result, setResult] = useState(null);
  const count = Object.keys(responses).length;
  const question = items[index];

  function reset(order) {
    setItems(order);
    setIndex(0);
    setResponses({});
    setResult(null);
  }

  function submit() {
    const graded = grade(items.filter(item => responses[item.id] !== undefined), responses);
    setResult(graded);
    setProgress(previous => recordAttempt(previous, graded));
  }

  return <>
    <section className="quiz">
      <div className="section-heading"><div><h2>{result ? 'Kết quả luyện tập' : 'Luyện trắc nghiệm'}</h2><p>{result ? `Đã trả lời ${count}/${items.length} câu` : 'Chọn đáp án và nộp bài để xem kết quả.'}</p></div>
        <button className="outline-button" type="button" onClick={() => {
          const order = items.length > 1 ? shuffled(items) : items;
          setItems(order);
          setIndex(0);
          setResult(null);
        }}><Shuffle size={17} /> Trộn câu hỏi</button>
      </div>
      {result ? <div className="result">
        <div className="result-summary" aria-live="polite">
          <span className="tile-icon tone-3"><Target size={24} /></span>
          <div><h3>{result.graded ? `${result.correct}/${result.graded} câu đúng` : 'Chưa có điểm'}</h3><p>{result.rows.length - result.graded} câu đã trả lời đang cần kiểm chứng.</p></div>
        </div>
        {result.rows.map(({ question: item, selected, status }) => <article className="result-card" key={item.id}>
          <span className={'pill ' + status}>{status === 'correct' ? 'Đúng' : status === 'wrong' ? 'Sai' : 'Cần kiểm chứng'}</span>
          <h3>Câu {item.number}. {item.text}</h3>
          <p>Bạn chọn {letters[selected]}. {item.options[selected]}</p>
          {item.answer == null ? <p>Tài liệu nguồn chưa cung cấp đáp án hoặc lời giải thích.</p> : <>
            <p>Đáp án {letters[item.answer]}. {item.options[item.answer]}</p><p>{item.explanation || 'Chưa có lời giải thích.'}</p>
          </>}
        </article>)}
        <div className="quiz-actions"><button className="primary-button" onClick={() => reset(pool)}><RotateCcw size={16} /> Làm lại</button>{onExit && <button className="outline-button" onClick={onExit}>Về danh sách</button>}</div>
      </div> : <div className="quiz-box">
        <div className="quiz-meta"><span>Câu {index + 1}/{items.length}</span><span>{count} đã trả lời</span></div>
        <progress value={count} max={items.length} aria-label="Số câu đã trả lời" />
        <fieldset key={question.id}>
          <legend>{question.text}</legend>
          {question.options.map((option, position) => <label className={'option ' + (responses[question.id] === position ? 'chosen' : '')} key={position}>
            <input type="radio" name={question.id} checked={responses[question.id] === position} onChange={() => setResponses(previous => ({ ...previous, [question.id]: position }))} /><span>{letters[position]}</span>{option}
          </label>)}
        </fieldset>
        <div className="quiz-actions">
          <button className="outline-button" disabled={!index} onClick={() => setIndex(index - 1)}><ArrowLeft size={16} /> Câu trước</button>
          <button className="outline-button" disabled={index === items.length - 1} onClick={() => setIndex(index + 1)}>Câu sau <ArrowRight size={16} /></button>
          <button className="primary-button submit" disabled={!count} onClick={submit}>Nộp bài <Check size={16} /></button>
        </div>
      </div>}
    </section>
    {showBank && <section className="bank">
      <h2>Ngân hàng câu hỏi</h2><p className="muted">Xem đề theo thứ tự trong tài liệu gốc.</p>
      {pool.map(item => <details id={item.id} className="bank-item" key={item.id} tabIndex={-1}>
        <summary>Câu {item.number}. {item.text}</summary>
        <ol type="A">{item.options.map((option, position) => <li key={position}>{option}</li>)}</ol>
        {item.answer == null && <span className="pill">Cần kiểm chứng</span>}
      </details>)}
    </section>}
  </>;
}

const searchIndex = chapters.flatMap(chapter => [
  ...chapter.questions.map(question => ({ title: question.text, label: 'Câu ' + question.number, type: 'quiz', id: question.id, chapter, keywords: question.options.join(' ') })),
  ...chapter.terms.map((term, index) => ({ title: term.term + ' · ' + term.english, label: 'Thuật ngữ', type: 'terms', id: 'term-' + chapter.id + '-' + index, chapter, keywords: term.definition })),
  ...chapter.cases.map(item => ({ title: item.title, label: 'Case Study', type: 'cases', id: item.id, chapter, keywords: item.paragraphs.join(' ') })),
]).map(item => ({ ...item, normalized: normalize(item.title + ' ' + item.keywords) }));

function SearchDialog({ close, openResult }) {
  const dialog = useRef(null);
  const [query, setQuery] = useState('');
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  const value = normalize(query);
  const results = value ? searchIndex.filter(item => item.normalized.includes(value)) : [];

  return <dialog ref={dialog} className="search-dialog" aria-label="Tìm kiếm tài liệu" onCancel={close} onClick={event => { if (event.target === dialog.current) close(); }}>
    <div className="search-panel">
      <div className="search-field"><Search size={21} /><input autoFocus type="search" aria-label="Tìm câu hỏi, thuật ngữ" placeholder="Tìm câu hỏi, thuật ngữ..." value={query} onChange={event => setQuery(event.target.value)} /><button className="icon-button" aria-label="Đóng tìm kiếm" onClick={close}><X size={20} /></button></div>
      <div className="search-results">
        <p className="muted">{value ? results.length + ' kết quả' : 'Nhập từ khóa để tìm trong 5 chương.'}</p>
        {results.map(item => <button className="search-result" key={item.id} onClick={() => openResult(chapterUrl(item.chapter.id, item.type), item.id)}>
          <span><small>Chương {item.chapter.id} · {item.label}</small><strong>{item.title}</strong></span><ArrowDownRight size={17} />
        </button>)}
      </div>
    </div>
  </dialog>;
}

createRoot(document.getElementById('root')).render(<App />);
