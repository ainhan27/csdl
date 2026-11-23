import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, ClipboardList,
  Database, GraduationCap, House, Layers3, Menu, Moon, Network, RotateCcw, Search,
  Sun, Target, Terminal, X,
} from 'lucide-react';
import c1 from './content/chapter-1.json';
import c2 from './content/chapter-2.json';
import c3 from './content/chapter-3.json';
import c4 from './content/chapter-4.json';
import c5 from './content/chapter-5.json';
import { createExam, emptyProgress, examEligible, examLength, grade, normalize, recordAttempt, reviewQueue, shuffled } from './study.js';
import './style.css';

const chapters = [c1, c2, c3, c4, c5];
const questions = chapters.flatMap(chapter => chapter.questions);
const icons = [Database, Network, Layers3, Terminal, ClipboardList];
const theoryTab = ['theory', 'Lý thuyết', BookOpen];
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
  const quizzing = section === 'quiz';
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
        <a className={'nav-item ' + (!chapter && !reviewing && !quizzing ? 'active' : '')} href="#/" onClick={() => setMenu(false)}><House size={18} /> Tổng quan</a>
        <a className={'nav-item ' + (quizzing ? 'active' : '')} href="#/quiz" onClick={() => setMenu(false)}><Target size={18} /> Trắc nghiệm</a>
        <a className={'nav-item ' + (reviewing ? 'active' : '')} href="#/luyen-lai" onClick={() => setMenu(false)}><RotateCcw size={18} /> Luyện câu sai {wrong.length > 0 && <span className="side-count">{wrong.length}</span>}</a>
        <p className="nav-label chapter-label">CHƯƠNG HỌC</p>
        {chapters.map(item => <a key={item.id} className={'nav-item nav-chapter ' + (chapter?.id === item.id ? 'active' : '')} href={chapterUrl(item.id)} onClick={() => setMenu(false)}>
          <BookOpen size={17} /><span>{item.title}</span>
        </a>)}
      </nav>
      <div className="sidebar-bottom"><GraduationCap size={19} /><div><strong>Ôn thi cuối kỳ</strong><small>Học phần MIS2001</small></div></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div className="crumb"><button className="icon-button mobile-menu" aria-label={menu ? "Đóng menu" : "Mở menu"} aria-expanded={menu} onClick={() => setMenu(!menu)}><Menu size={21} /></button><span className="crumb-root">Học tập</span><ChevronRight className="crumb-root" size={15} /><strong>{chapter ? 'Chương ' + chapter.id : reviewing ? 'Luyện câu sai' : quizzing ? 'Trắc nghiệm' : 'Tổng quan'}</strong></div>
        <div className="top-actions">
          <button className="search-button" aria-label="Tìm câu hỏi, lý thuyết" onClick={() => setSearch(true)}><Search size={17} /><span>Tìm câu hỏi, lý thuyết...</span><kbd>Ctrl K</kbd></button>
          <button className="icon-button" aria-label={theme === 'dark' ? 'Bật giao diện sáng' : 'Bật giao diện tối'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button>
        </div>
      </header>
      <main className="main">
        {chapter ? <Chapter key={chapter.id} chapter={chapter} requestedTab={tab} targetId={targetId} progress={progress} setProgress={setProgress} />
          : reviewing ? <Review wrong={wrong} setProgress={setProgress} />
          : quizzing ? <QuizHub setProgress={setProgress} />
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
        <a className="hero-quiz" href="#/quiz">Giải trắc nghiệm <ArrowRight size={17} /></a>
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
            <div className="card-top"><span className={'tile-icon tone-' + chapter.id}><Icon size={22} /></span></div>
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

function Chapter({ chapter, requestedTab, targetId, progress, setProgress }) {
  const tabs = [theoryTab, chapter.questions.length ? ['quiz', 'Trắc nghiệm', Target] : ['cases', 'Case Study', ClipboardList]];
  const tab = tabs.some(([name]) => name === requestedTab) ? requestedTab : 'theory';
  const Icon = icons[chapter.id - 1];
  const complete = Boolean(progress.completed[chapter.id]);
  function toggleComplete() {
    setProgress(previous => ({ ...previous, completed: { ...previous.completed, [chapter.id]: !previous.completed[chapter.id] } }));
  }
  return <>
    <a className="back-link" href="#/"><ArrowLeft size={16} /> Tổng quan</a>
    <div className="chapter-banner">
      <span className={'tile-icon tone-' + chapter.id}><Icon size={27} /></span>
      <div><h1>{chapter.title}</h1><p>{chapter.description}</p></div>
      <button className={'outline-button ' + (complete ? 'marked' : '')} aria-pressed={complete} onClick={toggleComplete}><Check size={17} /> {complete ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</button>
    </div>
    <nav className="tabs" aria-label="Nội dung chương">
      {tabs.map(([value, label, TabIcon]) => <a key={value} href={chapterUrl(chapter.id, value)} aria-current={tab === value ? 'page' : undefined}><TabIcon size={17} /> {label}</a>)}
    </nav>
    {tab === 'theory' && <section className="reading">
      <h2>Lý thuyết</h2>
      <nav className="theory-index" aria-label="Mục lục lý thuyết">
        {chapter.theory.map(({ title }, index) => <a key={index} href={chapterUrl(chapter.id) + '/theory-' + index}>{title}</a>)}
      </nav>
      {chapter.theory.map(({ title, text, example, source }, index) => <article className="reading-card theory-card" key={title} id={'theory-' + index} tabIndex={-1}>
        <h3>{title}</h3>
        {text.split('\n').map((section, part) => <p key={part}>{section}</p>)}
        {example && <pre><code>{example}</code></pre>}
        <small>{source}</small>
      </article>)}
    </section>}
    {tab === 'quiz' && <QuizHub key={targetId ?? 'setup'} initialChapter={chapter} questionId={targetId} setProgress={setProgress} />}
    {tab === 'cases' && <section className="reading"><h2>Bài tập tình huống</h2>
      {chapter.cases.map(item => <article className="case-card" key={item.id} id={item.id} tabIndex={-1}>
        <span className="pill">Tự luận · Câu {item.number}</span><h3>{item.title}</h3>
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
    <a className="back-link" href="#/quiz"><ArrowLeft size={16} /> Trắc nghiệm</a>
    <div className="section-heading"><div><h1>Luyện câu sai</h1><p>Ôn lại các câu đã chấm mà bạn trả lời sai.</p></div></div>
    {session ? <Quiz items={session} mode="practice" setProgress={setProgress} onExit={() => setSession(null)} />
      : <div className="empty"><RotateCcw size={34} />
        <h2>{wrong.length ? wrong.length + ' câu cần luyện lại' : 'Chưa có câu sai đã xác nhận'}</h2>
        {wrong.length > 0 && <button className="primary-button" onClick={() => setSession(wrong)}>Bắt đầu luyện lại <ArrowRight size={16} /></button>}
      </div>}
  </>;
}

function QuizHub({ initialChapter, questionId, setProgress }) {
  const [scope, setScope] = useState(initialChapter?.id ?? 0);
  const [mix, setMix] = useState(false);
  const pool = scope ? chapters.find(item => item.id === scope).questions : questions;
  const match = questionId ? pool.findIndex(item => item.id === questionId) : -1;
  const [session, setSession] = useState(() => match < 0 ? null : { mode: 'practice', items: pool, index: match });
  const verified = examEligible(pool);

  function start(mode) {
    const items = mode === 'exam' ? createExam(verified) : mix ? shuffled(pool) : pool;
    setSession({ mode, items, index: 0 });
    window.scrollTo(0, 0);
  }

  return <>
    {!initialChapter && <h1 className="quiz-page-title">Trắc nghiệm</h1>}
    {session ? <Quiz {...session} setProgress={setProgress} onExit={() => {
      setSession(null);
      window.scrollTo(0, 0);
    }} /> : <section className="quiz-setup">
      <div className="reading-card quiz-settings">
        <label>Phạm vi ôn tập
          <select value={scope} onChange={event => setScope(Number(event.target.value))}>
            <option value={0}>Tất cả các chương</option>
            {chapters.filter(item => item.questions.length).map(item => <option key={item.id} value={item.id}>Chương {item.id}</option>)}
          </select>
        </label>
        <label className="mix-setting"><input type="checkbox" checked={mix} onChange={event => setMix(event.target.checked)} /> Trộn câu hỏi khi luyện tập</label>
      </div>
      <div className="quiz-modes">
        <article className="case-card">
          <span className="tile-icon tone-1"><ClipboardList size={23} /></span>
          <h2>Làm bài thi</h2><p>{examLength} câu được chọn ngẫu nhiên. Đáp án và lời giải mở sau khi nộp bài.</p>
          <button className="primary-button" disabled={verified.length < examLength} onClick={() => start('exam')}>Bắt đầu thi <ArrowRight size={16} /></button>
          {verified.length < examLength && <p>Phạm vi này có {verified.length}/{examLength} câu đã xác minh. Bạn có thể chọn phạm vi lớn hơn.</p>}
        </article>
        <article className="case-card">
          <span className="tile-icon tone-3"><Target size={23} /></span>
          <h2>Luyện tập</h2><p>Làm cả {pool.length} câu trong phạm vi đã chọn. Xem giải thích sau khi xác nhận từng câu.</p>
          <button className="primary-button" onClick={() => start('practice')}>Bắt đầu luyện <ArrowRight size={16} /></button>
        </article>
      </div>
    </section>}
  </>;
}

function Feedback({ row }) {
  const { question, status } = row;
  return <div className="answer-feedback">
    <span className={'pill ' + status}>{status === 'correct' ? 'Đúng' : status === 'wrong' ? 'Sai' : 'Cần kiểm chứng'}</span>
    {question.answer != null && <p><strong>Đáp án {letters[question.answer]}.</strong> {question.options[question.answer]}</p>}
    <p>{question.explanation || 'Chưa có lời giải đã xác minh cho câu này.'}</p>
  </div>;
}

function Quiz({ items, mode, index: initialIndex = 0, setProgress, onExit }) {
  const [index, setIndex] = useState(initialIndex);
  const [responses, setResponses] = useState({});
  const [confirmed, setConfirmed] = useState({});
  const [result, setResult] = useState(null);
  const exam = mode === 'exam';
  const count = Object.keys(exam ? responses : confirmed).length;
  const question = items[index];
  const answered = Boolean(confirmed[question.id]);

  function move(next) {
    setIndex(next);
    document.getElementById('quiz-question')?.scrollIntoView({ block: 'start' });
  }

  function checkAnswer() {
    const checked = grade([question], responses);
    setConfirmed(previous => ({ ...previous, [question.id]: true }));
    setProgress(previous => recordAttempt(previous, checked));
  }

  function submit() {
    if (count !== items.length) return;
    const graded = grade(items, responses);
    setResult(graded);
    if (exam) setProgress(previous => recordAttempt(previous, graded));
    window.scrollTo(0, 0);
  }

  return <section className="quiz">
    <div className="section-heading">
      <div><h2>{result ? 'Kết quả ' + (exam ? 'bài thi' : 'luyện tập') : exam ? 'Bài thi' : 'Luyện tập'}</h2>
      <p>{count}/{items.length} câu đã {exam ? 'chọn đáp án' : 'xác nhận'}</p></div>
      <button className="outline-button" onClick={onExit}><ArrowLeft size={16} /> Thoát bài</button>
    </div>
    {result ? <div className="result">
      <div className="result-summary" aria-live="polite"><span className="tile-icon tone-3"><Target size={24} /></span><div>
        <h3>{result.graded ? `${result.correct}/${result.graded} câu đúng` : 'Chưa có điểm'}</h3>
        {result.graded < items.length && <p>{items.length - result.graded} câu cần kiểm chứng.</p>}
      </div></div>
      {result.rows.map(row => <article className="result-card" key={row.question.id}>
        <h3>Chương {row.question.id.split('-')[0]} · Câu {row.question.number}. {row.question.text}</h3>
        <p>Bạn chọn {letters[row.selected]}. {row.question.options[row.selected]}</p>
        <Feedback row={row} />
      </article>)}
    </div> : <div className="quiz-layout">
      <div className="quiz-box" id="quiz-question">
        <div className="quiz-meta"><span>Câu {index + 1}/{items.length}</span><span>Chương {question.id.split('-')[0]} · Câu gốc {question.number}</span></div>
        <progress value={count} max={items.length} aria-label="Số câu đã trả lời" />
        <fieldset key={question.id} disabled={!exam && answered}>
          <legend>{question.text}</legend>
          {question.options.map((option, position) => <label className={'option ' + (responses[question.id] === position ? 'chosen' : '')} key={position}>
            <input type="radio" name={question.id} checked={responses[question.id] === position} onChange={() => setResponses(previous => ({ ...previous, [question.id]: position }))} />
            <span>{letters[position]}</span>{option}
          </label>)}
        </fieldset>
        {!exam && answered && <div aria-live="polite"><Feedback row={grade([question], responses).rows[0]} /></div>}
        <div className="quiz-actions">
          <button className="outline-button" disabled={!index} onClick={() => move(index - 1)}><ArrowLeft size={16} /> Câu trước</button>
          <button className="outline-button" disabled={index === items.length - 1} onClick={() => move(index + 1)}>Câu sau <ArrowRight size={16} /></button>
          {!exam && !answered && <button className="primary-button submit" disabled={responses[question.id] === undefined} onClick={checkAnswer}>Xác nhận đáp án <Check size={16} /></button>}
        </div>
      </div>
      <aside className="quiz-box question-panel">
        <h3>Danh sách câu hỏi</h3>
        <div className="question-nav" aria-label="Chuyển câu hỏi">
          {items.map((item, position) => <button key={item.id} className={(exam ? responses[item.id] !== undefined : confirmed[item.id]) ? 'filled' : ''} aria-label={'Đến câu ' + (position + 1)} aria-current={index === position ? 'step' : undefined} onClick={() => move(position)}>{position + 1}</button>)}
        </div>
        <button className="primary-button" disabled={count !== items.length} onClick={submit}>{exam ? 'Nộp bài' : 'Xem tổng kết'} <Check size={16} /></button>
        {count !== items.length && <p className="muted">Còn {items.length - count} câu.</p>}
      </aside>
    </div>}
  </section>;
}

const searchIndex = chapters.flatMap(chapter => [
  ...chapter.questions.map(question => ({ title: question.text, label: 'Câu ' + question.number, type: 'quiz', id: question.id, chapter, keywords: question.options.join(' ') })),
  ...chapter.theory.map(({ title, text }, index) => ({ title, label: 'Lý thuyết', type: 'theory', id: 'theory-' + index, chapter, keywords: text })),
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
      <div className="search-field"><Search size={21} /><input autoFocus type="search" aria-label="Tìm câu hỏi, lý thuyết" placeholder="Tìm câu hỏi, lý thuyết..." value={query} onChange={event => setQuery(event.target.value)} /><button className="icon-button" aria-label="Đóng tìm kiếm" onClick={close}><X size={20} /></button></div>
      <div className="search-results">
        <p className="muted">{value ? results.length + ' kết quả' : 'Nhập từ khóa để tìm trong 5 chương.'}</p>
        {results.map(item => <button className="search-result" key={item.chapter.id + '/' + item.id} onClick={() => openResult(chapterUrl(item.chapter.id, item.type), item.id)}>
          <span><small>Chương {item.chapter.id} · {item.label}</small><strong>{item.title}</strong></span><ArrowDownRight size={17} />
        </button>)}
      </div>
    </div>
  </dialog>;
}

createRoot(document.getElementById('root')).render(<App />);
