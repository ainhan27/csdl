import React from 'react';
import { assessCase } from './case-scoring.js';

const formatScore = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });

export function CaseStudy({ item, draft, reviewed, onDraft, onReview }) {
  const rubric = item.rubric ?? [];
  const report = reviewed && draft.trim() && rubric.length && assessCase(rubric, draft);

  return <article className="case-card" id={item.id} tabIndex={-1}>
    <span className="pill">Tự luận · Câu {item.number}</span><h3>{item.title}</h3>
    {item.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
    <label htmlFor={'draft-' + item.id}>Bài làm của bạn</label>
    <textarea id={'draft-' + item.id} placeholder="Nhập ghi chú hoặc bài giải..." value={draft} onChange={event => onDraft(event.target.value)} />
    {rubric.length > 0 && <div className="case-action">
      <button type="button" className="primary-button" disabled={!draft.trim() || Boolean(report)} onClick={onReview}>Chấm bài</button>
    </div>}
    {Boolean(report) && <section className="case-rubric" aria-label="Kết quả chấm bài">
      <div className="rubric-score" role="status">
        <strong>Điểm ước lượng {formatScore.format(report.score)}/{report.maximum}</strong>
      </div>
      <p>Điểm dựa trên các cụm từ nhận diện ý chính. Cách diễn đạt khác có thể chưa được nhận ra, và hệ thống không đánh giá được lập luận.</p>
      <h4>Đáp án tham khảo</h4>
      {report.criteria.map(({ id, points, title, answer, earned, missing }) => <article className="rubric-criterion" key={id}>
        <h5>{title} <span>· {formatScore.format(earned)}/{formatScore.format(points)} điểm</span></h5>
        {missing.length > 0 && <p className="rubric-missing">Ý chưa nhận diện: {missing.map(aliases => aliases[0]).join(', ')}.</p>}
        <p>{answer}</p>
      </article>)}
      <small>Nguồn đáp án tham khảo: “Câu 1đ NoSQL (1)”.</small>
    </section>}
  </article>;
}
