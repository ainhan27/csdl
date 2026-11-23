import React from 'react';

const ratings = [['0', 'Chưa đạt'], ['0.5', 'Một phần'], ['1', 'Đạt']];
const formatScore = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });

export function CaseStudy({ item, draft, assessment, onDraft, onRate }) {
  const rubric = item.rubric ?? [];
  const score = rubric.reduce((total, { id, points }) => total + points * Number(assessment[id] || 0), 0);
  const assessed = rubric.filter(({ id }) => assessment[id] !== undefined).length;
  const maximum = rubric.reduce((total, { points }) => total + points, 0);

  return <article className="case-card" id={item.id} tabIndex={-1}>
    <span className="pill">Tự luận · Câu {item.number}</span><h3>{item.title}</h3>
    {item.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
    <label htmlFor={'draft-' + item.id}>Bài làm của bạn</label>
    <textarea id={'draft-' + item.id} placeholder="Nhập ghi chú hoặc bài giải..." value={draft} onChange={event => onDraft(event.target.value)} />
    {rubric.length > 0 && <details className="case-rubric">
      <summary>Đáp án tham khảo và tự chấm</summary>
      <p>Đối chiếu bài làm với các ý dưới đây và chọn mức đạt. Điểm tự chấm được lưu trên trình duyệt.</p>
      <div className="rubric-score" aria-live="polite">
        <strong>{!assessed ? 'Chưa tự chấm' : `${formatScore.format(score)}/${maximum} điểm`}</strong>
        <span>{assessed}/{rubric.length} tiêu chí đã đánh giá</span>
      </div>
      {rubric.map(({ id, points, title, answer }) => <fieldset className="rubric-criterion" key={id}>
        <legend>{title} <span>· {formatScore.format(points)} điểm</span></legend>
        <p>{answer}</p>
        <div className="rubric-ratings">
          {ratings.map(([value, label]) => <label key={value}>
            <input type="radio" name={item.id + '-' + id} value={value}
              checked={assessment[id] === value} onChange={() => onRate(id, value)} />
            {label}
          </label>)}
        </div>
      </fieldset>)}
      <small>Đáp án tham khảo từ tài liệu “Câu 1đ NoSQL (1)”. Thang 10 điểm dùng để tự ôn tập.</small>
    </details>}
  </article>;
}
