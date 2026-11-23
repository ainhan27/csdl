import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimateUIProvider } from '@animate-ui/react/provider';
import { Button } from '@animate-ui/react/primitives/buttons/button';
import { Entrance } from './animation.jsx';
import {
  ArrowDownRight, ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, ClipboardList,
  Database, GraduationCap, Grid3X3, House, Layers3, Menu, Moon, Network, RotateCcw, Search,
  Sun, Target, Terminal, X, CircleHelp,
} from 'lucide-react';
import c1 from './content/chapter-1.json';
import c2 from './content/chapter-2.json';
import c3 from './content/chapter-3.json';
import c4 from './content/chapter-4.json';
import c5 from './content/chapter-5.json';
import { createExam, emptyProgress, examEligible, examLength, grade, normalize, recordAttempt, reviewQueue, shuffled } from './study.js';
import '@fontsource-variable/montserrat/wght.css';
import { TheoryDiagram } from './theory-diagrams.jsx';
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
  const menuTrigger = useRef(null);
  const [searchSelection, setSearchSelection] = useState(0);
  const [, section, id, tab, targetId] = hash.slice(1).split('/');
  const chapter = section === 'chuong' ? chapters.find(item => item.id === Number(id)) : null;
  const reviewing = section === 'luyen-lai';
  const legacyQuiz = section === 'quiz';
  useEffect(() => {
    if (legacyQuiz) location.replace('#/chuong/1/quiz');
  }, [legacyQuiz]);
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
    if (!menu) return;
    const closeOnEscape = event => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        setMenu(false);
        menuTrigger.current?.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menu]);
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
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content').focus(); }}>Đến nội dung chính</a>
    {menu && <Entrance><button className="mobile-scrim" aria-label="Đóng menu" onClick={() => setMenu(false)} /></Entrance>}
    <aside id="site-sidebar" className={'sidebar' + (menu ? ' open' : '')}>
      <a className="brand" href="#/" onClick={() => setMenu(false)}>
        <span className="brand-icon"><Database size={23} /></span>
        <span><strong>MIS<span>2001</span></strong><small>Cơ sở dữ liệu</small></span>
      </a>
      <button className="icon-button drawer-close" aria-label="Đóng điều hướng" onClick={() => { setMenu(false); menuTrigger.current?.focus(); }}><X size={19} /></button>
      <nav aria-label="Điều hướng chính">
        <p className="nav-label">HỌC TẬP</p>
        <a className={'nav-item ' + (!chapter && !reviewing ? 'active' : '')} href="#/" aria-current={!chapter && !reviewing ? 'page' : undefined} onClick={() => setMenu(false)}><House size={18} /> Tổng quan</a>
        <a className={'nav-item ' + (reviewing ? 'active' : '')} href="#/luyen-lai" aria-current={reviewing ? 'page' : undefined} onClick={() => setMenu(false)}><RotateCcw size={18} /> Luyện câu sai {wrong.length > 0 && <span className="side-count">{wrong.length}</span>}</a>
        <p className="nav-label chapter-label">CHƯƠNG HỌC</p>
        {chapters.map(item => <a key={item.id} className={'nav-item nav-chapter ' + (chapter?.id === item.id ? 'active' : '')} href={chapterUrl(item.id)} aria-current={chapter?.id === item.id ? 'page' : undefined} onClick={() => setMenu(false)}>
          <BookOpen size={17} /><span>{item.title}</span>
        </a>)}
      </nav>
      <div className="sidebar-bottom"><GraduationCap size={19} /><div><strong>Ôn thi cuối kỳ</strong><small>Học phần MIS2001</small></div></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div className="crumb"><button ref={menuTrigger} className="icon-button mobile-menu" aria-controls="site-sidebar" aria-label={menu ? "Đóng menu" : "Mở menu"} aria-expanded={menu} onClick={() => setMenu(!menu)}><Menu size={21} /></button><span className="crumb-root">Học tập</span><ChevronRight className="crumb-root" size={15} /><strong>{chapter ? 'Chương ' + chapter.id : reviewing ? 'Luyện câu sai' : 'Tổng quan'}</strong></div>
        <div className="top-actions">
          <button className="search-button" aria-label="Tìm câu hỏi, lý thuyết" onClick={() => setSearch(true)}><Search size={17} /><span>Tìm câu hỏi, lý thuyết...</span><kbd>Ctrl K</kbd></button>
          <button className="icon-button" aria-label={theme === 'dark' ? 'Bật giao diện sáng' : 'Bật giao diện tối'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button>
        </div>
      </header>
      <main className="main" id="main-content" tabIndex={-1}>
        <Entrance key={chapter ? chapter.id + '/' + (tab ?? 'theory') : reviewing ? 'review' : 'home'}>
          <div>
            {chapter ? <Chapter key={chapter.id} chapter={chapter} requestedTab={tab} targetId={targetId} progress={progress} setProgress={setProgress} />
              : reviewing ? <Review wrong={wrong} setProgress={setProgress} />
              : <Dashboard progress={progress} />}
          </div>
        </Entrance>
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
  const quizChapter = next.questions.length ? next : chapters[0];
  const practiced = questions.filter(question => progress.attempts[question.id]).length;

  return <>
    <div className="hero">
      <div className="hero-copy">
        <span className="hero-tag"><GraduationCap size={17} /> Ôn tập cuối kỳ</span>
        <h1>Cơ sở<br className="hero-break" /> dữ liệu<span>.</span></h1>
        <p>Ôn lý thuyết theo chương và luyện đề MIS2001 theo tiến độ của bạn.</p>
        <div className="hero-actions">
          <Button asChild><a className="primary-button" href={chapterUrl(next.id)}>{completed || practiced ? 'Tiếp tục học' : 'Bắt đầu học'} <ArrowRight size={17} /></a></Button>
          <Button asChild><a className="outline-button" href={chapterUrl(quizChapter.id, 'quiz')}><Target size={17} /> Trắc nghiệm chương {quizChapter.id}</a></Button>
        </div>
      </div>
      <div className="hero-art" aria-hidden="true" />
    </div>
    <div className="stats">
      <Stat icon={BookOpen} tone={1} label="Chương học" value={chapters.length} />
      <Stat icon={ClipboardList} tone={2} label="Câu trắc nghiệm" value={questions.length} hint={practiced ? `Đã luyện ${practiced} câu` : undefined} />
      <Stat icon={Target} tone={3} label="Tiến độ học" value={completed + '/' + chapters.length} hint="chương hoàn thành" progress={completed / chapters.length * 100} />
    </div>
    <section id="chuong-hoc">
      <div className="section-heading"><h2>Chương học</h2></div>
      <div className="chapter-grid">
        {chapters.map(chapter => {
          const Icon = icons[chapter.id - 1];
          return <Button key={chapter.id} asChild tapScale={0.985}><a className="chapter-card" href={chapterUrl(chapter.id)}>
            <div className="card-top"><span className={'tile-icon tone-' + chapter.id}><Icon size={22} /></span><span className="card-arrow"><ArrowRight size={17} /></span></div>
            <h3>{chapter.title}</h3><p>{chapter.description}</p>
            <div className="card-bottom"><span>{progress.completed[chapter.id] ? <><Check size={15} /> Đã hoàn thành</> : chapter.questions.length ? <><ClipboardList size={15} /> {chapter.questions.length} câu hỏi</> : <><ClipboardList size={15} /> {chapter.cases.length} câu tự luận</>}</span></div>
          </a></Button>;
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
    <div className="chapter-context">
      <a className="back-link" href="#/"><ArrowLeft size={16} /> Tổng quan</a>
      <div className="chapter-banner">
        <span className={'tile-icon tone-' + chapter.id}><Icon size={27} /></span>
        <div><h1>{chapter.title}</h1><p>{chapter.description}</p></div>
        <button className={'outline-button ' + (complete ? 'marked' : '')} aria-pressed={complete} onClick={toggleComplete}><Check size={17} /> {complete ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</button>
      </div>
      <nav className="tabs" aria-label="Nội dung chương">
        {tabs.map(([value, label, TabIcon]) => <a key={value} href={chapterUrl(chapter.id, value)} aria-current={tab === value ? 'page' : undefined}><TabIcon size={17} /> {label}</a>)}
      </nav>
    </div>
    {tab === 'theory' && <section className="reading">
      <h2>Lý thuyết</h2>
      <nav className="theory-index" aria-label="Mục lục lý thuyết">
        {chapter.theory.map(({ title }, index) => <a key={index} href={chapterUrl(chapter.id) + '/theory-' + index}>{title}</a>)}
      </nav>
      {chapter.theory.map(({ title, text, example, source, diagram }, index) => <article className="reading-card theory-card" key={title} id={'theory-' + index} tabIndex={-1}>
        <h3>{title}</h3>
        {diagram && <TheoryDiagram diagram={diagram} />}
        {text.split('\n').map((section, part) => <p key={part}>{section}</p>)}
        {example && <pre><code>{example}</code></pre>}
        <small>{source}</small>
      </article>)}
    </section>}
    {tab === 'quiz' && <QuizHub key={targetId ?? 'setup'} chapter={chapter} questionId={targetId} setProgress={setProgress} />}
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
    <a className="back-link" href="#/"><ArrowLeft size={16} /> Tổng quan</a>
    <div className="section-heading"><div><h1>Luyện câu sai</h1><p>Ôn lại các câu đã chấm mà bạn trả lời sai.</p></div></div>
    {session ? <Quiz items={session} mode="practice" setProgress={setProgress} onExit={() => setSession(null)} />
      : <div className="empty"><RotateCcw size={34} />
        <h2>{wrong.length ? wrong.length + ' câu cần luyện lại' : 'Chưa có câu sai đã xác nhận'}</h2>
        {wrong.length > 0 && <Button className="primary-button" onClick={() => setSession(shuffled(wrong))}>Bắt đầu luyện lại <ArrowRight size={16} /></Button>}
      </div>}
  </>;
}

function QuizHub({ chapter, questionId, setProgress }) {
  const pool = chapter.questions;
  const verified = examEligible(pool);
  const previous = useRef({});
  const [session, setSession] = useState(() => {
    const match = pool.find(item => item.id === questionId);
    return match ? { mode: 'practice', items: [match, ...shuffled(pool.filter(item => item !== match))] } : null;
  });

  function start(mode) {
    const items = mode === 'exam' ? createExam(verified) : shuffled(pool);
    const latest = previous.current[mode] ?? (session?.mode === mode ? session.items : []);
    if (items.length > 1 && items.every((item, index) => item === latest[index])) items.push(items.shift());
    previous.current[mode] = items;
    setSession({ mode, items });
    window.scrollTo(0, 0);
  }

  return session ? <Quiz {...session} setProgress={setProgress} onExit={() => {
    previous.current[session.mode] = session.items;
    setSession(null);
    window.scrollTo(0, 0);
  }} /> : <section className="quiz-modes" aria-label={'Trắc nghiệm ' + chapter.title}>
    <article className="case-card">
      <span className="tile-icon tone-1"><ClipboardList size={23} /></span>
      <h2>Làm bài thi</h2><p>{examLength} câu ngẫu nhiên trong chương. Xem đáp án và lời giải sau khi nộp bài.</p>
      <Button className="primary-button" disabled={verified.length < examLength} onClick={() => start('exam')}>Bắt đầu thi <ArrowRight size={16} /></Button>
      {verified.length < examLength && <p>Chương này có {verified.length}/{examLength} câu đã xác minh.</p>}
    </article>
    <article className="case-card">
      <span className="tile-icon tone-3"><Target size={23} /></span>
      <h2>Luyện tập</h2><p>Xáo trộn cả {pool.length} câu. Xem lời giải ngay khi chọn đáp án.</p>
      <Button className="primary-button" onClick={() => start('practice')}>Bắt đầu luyện <ArrowRight size={16} /></Button>
    </article>
  </section>;
}

function Feedback({ row }) {
  const { question, status } = row;
  const Mark = status === 'correct' ? Check : status === 'wrong' ? X : CircleHelp;
  return <div className={'answer-feedback ' + status}>
    <div className="feedback-heading">
      <span className="feedback-icon"><Mark size={16} aria-hidden="true" /></span>
      <strong>Lời giải</strong>
      <span className={'pill ' + status}>{status === 'correct' ? 'Đúng' : status === 'wrong' ? 'Sai' : 'Cần kiểm chứng'}</span>
    </div>
    {question.answer != null && <p className="verified-answer"><strong>Đáp án {letters[question.answer]}.</strong> {question.options[question.answer]}</p>}
    <p>{question.explanation || 'Chưa có lời giải đã xác minh cho câu này.'}</p>
  </div>;
}

function Quiz({ items, mode, setProgress, onExit }) {
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [result, setResult] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const exam = mode === 'exam';
  const count = Object.keys(responses).length;
  const question = items[index];
  const answered = !exam && responses[question.id] !== undefined;

  function move(next, fromQuestionList = false) {
    setIndex(next);
    if (fromQuestionList) {
      setShowQuestions(false);
      requestAnimationFrame(() => document.querySelector('#quiz-question legend')?.focus({ preventScroll: true }));
    }
    document.getElementById('quiz-question')?.scrollIntoView({ block: 'start' });
  }

  function choose(position) {
    if (answered) return;
    setResponses(previous => ({ ...previous, [question.id]: position }));
    if (!exam) {
      const checked = grade([question], { [question.id]: position });
      setProgress(previous => recordAttempt(previous, checked));
    }
  }

  function submit() {
    if (count !== items.length) return;
    const graded = grade(items, responses);
    setResult(graded);
    if (exam) setProgress(previous => recordAttempt(previous, graded));
    window.scrollTo(0, 0);
  }

  return <section className="quiz">
    <div className="section-heading quiz-heading">
      <div><h2>{result ? 'Kết quả ' + (exam ? 'bài thi' : 'luyện tập') : exam ? 'Bài thi' : 'Luyện tập'}</h2>
      <p>{count}/{items.length} câu đã trả lời</p></div>
      <Button className="outline-button" onClick={onExit}><ArrowLeft size={16} /> Thoát bài</Button>
    </div>
    {!result && <div className="quiz-progress">
      <div><strong>Tiến độ làm bài</strong><span>{count > 0 && count / items.length < 0.01 ? '<1%' : Math.floor(count / items.length * 100) + '%'}</span></div>
      <progress value={count} max={items.length} aria-label="Số câu đã trả lời" />
      <Button className="outline-button question-toggle" aria-expanded={showQuestions} aria-controls="question-list" onClick={() => setShowQuestions(value => !value)}>
        <Grid3X3 size={17} /> {showQuestions ? 'Ẩn danh sách câu hỏi' : 'Danh sách câu hỏi'} <ChevronDown size={16} />
      </Button>
    </div>}
    {result ? <div className="result">
      <Entrance><div className="result-summary" aria-live="polite"><span className="tile-icon tone-3"><Target size={24} /></span><div>
        <p className="score-label">Điểm trắc nghiệm</p>
        <h3>{result.graded ? `${result.correct}/${result.graded} câu đúng` : 'Chưa có điểm'}</h3>
        {result.graded < items.length && <p>{items.length - result.graded} câu cần kiểm chứng.</p>}
      </div></div></Entrance>
      {result.rows.map(row => <article className="result-card" key={row.question.id}>
        <h3>Chương {row.question.id.split('-')[0]} · Câu {row.question.number}. {row.question.text}</h3>
        <p>Bạn chọn {letters[row.selected]}. {row.question.options[row.selected]}</p>
        <Feedback row={row} />
      </article>)}
    </div> : <div className={'quiz-layout' + (showQuestions ? ' with-questions' : '')}>
      <div className="quiz-box" id="quiz-question">
        <div className="quiz-meta"><span>Câu {index + 1}/{items.length}</span><span>Chương {question.id.split('-')[0]} · Câu gốc {question.number}</span></div>
        <Entrance key={question.id}><fieldset disabled={!exam && answered}>
          <legend tabIndex={-1}>{question.text}</legend>
          {question.options.map((option, position) => {
            const chosen = responses[question.id] === position;
            const correct = answered && question.answer === position;
            const incorrect = answered && chosen && question.answer != null && !correct;
            return <label className={'option' + (chosen ? ' chosen' : '') + (correct ? ' correct' : incorrect ? ' wrong' : '')} key={position}>
              <input type="radio" name={question.id} checked={chosen} onChange={() => choose(position)} />
              <span className="option-letter">{letters[position]}</span><span className="option-text">{option}</span>
              {correct ? <Check className="option-mark" size={17} aria-hidden="true" /> : incorrect ? <X className="option-mark" size={17} aria-hidden="true" /> : <span className="radio-mark" aria-hidden="true" />}
            </label>;
          })}
        </fieldset></Entrance>
        {!exam && answered && <Entrance key={question.id + "-feedback"}><div aria-live="polite"><Feedback row={grade([question], responses).rows[0]} /></div></Entrance>}
        <div className="quiz-actions">
          <Button className="outline-button" disabled={!index} onClick={() => move(index - 1)}><ArrowLeft size={16} /> Câu trước</Button>
          <Button className="outline-button" disabled={index === items.length - 1} onClick={() => move(index + 1)}>Câu sau <ArrowRight size={16} /></Button>
          <Button className="primary-button submit" disabled={count !== items.length} onClick={submit}>{exam ? 'Nộp bài' : 'Xem tổng kết'} <Check size={16} /></Button>
        </div>
      </div>
      <aside id="question-list" className="quiz-box question-panel" aria-label="Danh sách câu hỏi" hidden={!showQuestions}>
        {showQuestions && <>
          <h3><Grid3X3 size={17} /> Danh sách câu hỏi</h3>
          <div className="question-legend"><span><i /> Đã làm</span><span><i /> Câu hiện tại</span></div>
          <div className="question-nav" aria-label="Chuyển câu hỏi">
            {items.map((item, position) => {
              const done = responses[item.id] !== undefined;
              return <button key={item.id} className={done ? 'filled' : ''} aria-label={'Đến câu ' + (position + 1)} aria-description={done ? 'Đã làm' : 'Chưa làm'} title={done ? 'Đã làm' : 'Chưa làm'} aria-current={index === position ? 'step' : undefined} onClick={() => move(position, true)}>{position + 1}</button>;
            })}
          </div>
        </>}
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

  return <dialog ref={dialog} className="search-dialog" aria-label="Tìm kiếm tài liệu" onCancel={close}
    onKeyDown={event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      close();
    }}
    onClick={event => { if (event.target === dialog.current) close(); }}>
    <Entrance><div className="search-panel">
      <div className="search-field"><Search size={21} /><input autoFocus type="search" aria-label="Tìm câu hỏi, lý thuyết" placeholder="Tìm câu hỏi, lý thuyết..." value={query} onChange={event => setQuery(event.target.value)} /><button className="icon-button" aria-label="Đóng tìm kiếm" onClick={close}><X size={20} /></button></div>
      <div className="search-results">
        <p className="muted">{value ? results.length + ' kết quả' : 'Nhập từ khóa để tìm trong 5 chương.'}</p>
        {results.map(item => <button className="search-result" key={item.chapter.id + '/' + item.id} onClick={() => openResult(chapterUrl(item.chapter.id, item.type), item.id)}>
          <span><small>Chương {item.chapter.id} · {item.label}</small><strong>{item.title}</strong></span><ArrowDownRight size={17} />
        </button>)}
      </div>
    </div></Entrance>
  </dialog>;
}

createRoot(document.getElementById('root')).render(<AnimateUIProvider reducedMotion="user"><App /></AnimateUIProvider>);
