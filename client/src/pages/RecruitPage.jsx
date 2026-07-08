import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';

/* ─── Data (Vietnamese copy is canonical/kept verbatim for identity + submission;
   "*En" sibling fields hold the English display translation) ───────── */
const DEPARTMENTS = [
  {
    id: 'doi-ngoai',
    num: '01',
    name: 'Ban Đối ngoại',
    nameEn: 'External Relations Team',
    color: '#fbbf24',
    intro: 'Ban Đối ngoại là cầu nối giữa FTU Fashion Show 2026 và các doanh nghiệp, thương hiệu, đối tác đồng hành. Đây là vị trí phù hợp với những bạn yêu thích giao tiếp, có khả năng kết nối và muốn thử sức trong môi trường làm việc với đối tác thực tế.',
    introEn: 'The External Relations Team is the bridge between FTU Fashion Show 2026 and its business partners, brands, and sponsors. This role suits anyone who enjoys communication, has strong networking skills, and wants hands-on experience working with real partners.',
    tasks: [
      'Tìm kiếm và xây dựng danh sách đối tác, thương hiệu, doanh nghiệp tiềm năng.',
      'Hỗ trợ liên hệ, giới thiệu chương trình và làm việc với đối tác theo hướng dẫn.',
      'Chuẩn bị proposal, email, hồ sơ tài trợ và tài liệu làm việc.',
      'Theo dõi tiến độ, chăm sóc đối tác và phối hợp triển khai quyền lợi tài trợ.',
    ],
    tasksEn: [
      'Research and build a list of potential partners, brands, and businesses.',
      'Help reach out to and introduce the program to partners, and work with them as directed.',
      'Prepare proposals, emails, sponsorship packages, and working documents.',
      'Track progress, maintain partner relationships, and help deliver sponsorship benefits.',
    ],
    fit: [
      'Chủ động, trách nhiệm và nghiêm túc trong công việc.',
      'Giao tiếp tốt, lịch sự, tự tin khi làm việc với người khác.',
      'Kiên trì, chăm chỉ, sẵn sàng học hỏi và tiếp thu góp ý.',
      'Ưu tiên ứng viên từng có kinh nghiệm đối ngoại, tài trợ, bán hàng, chăm sóc khách hàng hoặc tổ chức sự kiện.',
    ],
    fitEn: [
      'Proactive, responsible, and serious about the work.',
      'Good communicator — polite and confident when working with others.',
      'Persistent, hard-working, and open to learning and feedback.',
      'Prior experience in external relations, sponsorship, sales, customer care, or event organizing is a plus.',
    ],
    questions: [
      'Vì sao bạn muốn trở thành Cộng tác viên Ban Đối ngoại của FTU Fashion Show 2026?',
      'Bạn đã từng có kinh nghiệm liên quan đến đối ngoại, tài trợ, bán hàng, chăm sóc khách hàng hoặc tổ chức sự kiện chưa? Nếu có, hãy chia sẻ ngắn gọn.',
      'Nếu đã liên hệ với một doanh nghiệp nhưng sau nhiều ngày chưa nhận được phản hồi, bạn sẽ xử lý như thế nào để tăng khả năng kết nối mà vẫn giữ được sự chuyên nghiệp?',
      'Trong một tuần, bạn có thể dành bao nhiêu thời gian cho chương trình? Bạn có thể tham gia các buổi họp, training và hoạt động trực tiếp khi được phân công không?',
    ],
    questionsEn: [
      'Why do you want to become an External Relations collaborator for FTU Fashion Show 2026?',
      'Have you had any experience in external relations, sponsorship, sales, customer care, or event organizing? If so, please briefly describe it.',
      "If you've reached out to a business but received no response after several days, how would you follow up in a way that improves your odds while staying professional?",
      'How much time can you commit to the program each week? Can you attend meetings, training sessions, and in-person activities when assigned?',
    ],
  },
  {
    id: 'truyen-thong',
    num: '02',
    name: 'Ban Truyền thông',
    nameEn: 'Media & Communications Team',
    color: '#f87171',
    intro: 'Ban Truyền thông phụ trách lan tỏa hình ảnh, câu chuyện và tinh thần của FTU Fashion Show 2026 đến công chúng. Đây là vị trí dành cho những bạn yêu thích sáng tạo nội dung, truyền thông mạng xã hội và muốn tham gia xây dựng hình ảnh cho một sự kiện thời trang chuyên nghiệp.',
    introEn: "The Media & Communications Team spreads the image, story, and spirit of FTU Fashion Show 2026 to the public. This role is for anyone who loves content creation and social media, and wants to help shape the image of a professional fashion event.",
    tasks: [
      'Sáng tạo nội dung cho các kênh truyền thông chính thức của chương trình.',
      'Phối hợp định hướng hình ảnh, video, teaser, trailer và các ấn phẩm truyền thông.',
      'Hỗ trợ xây dựng kế hoạch truyền thông cho các hoạt động của chương trình.',
      'Tham gia truyền thông tại sự kiện, ghi nhận hình ảnh và cập nhật nội dung khi cần.',
    ],
    tasksEn: [
      "Create content for the program's official media channels.",
      'Help direct the visuals, videos, teasers, trailers, and other media materials.',
      "Help build the communications plan for the program's activities.",
      'Cover the event on the ground, capture footage, and post updates as needed.',
    ],
    fit: [
      'Yêu thích viết lách, sáng tạo nội dung và nhạy bén với xu hướng mạng xã hội.',
      'Có tư duy thẩm mỹ, trách nhiệm và chịu được áp lực tiến độ.',
      'Làm việc nhóm tốt, biết phối hợp với các phân ban khác.',
      'Ưu tiên ứng viên có kinh nghiệm viết content, quản lý fanpage, chụp ảnh, quay dựng hoặc truyền thông sự kiện.',
    ],
    fitEn: [
      'Enjoys writing and content creation, with a sharp sense of social media trends.',
      'Good aesthetic sense, responsible, and able to handle deadline pressure.',
      'Works well in a team and coordinates smoothly with other departments.',
      'Experience with content writing, fanpage management, photography, video editing, or event media is a plus.',
    ],
    questions: [
      'Vì sao bạn muốn trở thành Cộng tác viên Ban Truyền thông của FTU Fashion Show 2026?',
      'Bạn đã từng có kinh nghiệm viết content, quản lý fanpage, lên kế hoạch truyền thông, chụp ảnh hoặc quay dựng chưa? Nếu có, hãy chia sẻ ngắn gọn hoặc đính kèm sản phẩm.',
      'Nếu một bài đăng quan trọng cần lên sóng trong 2 tiếng nữa nhưng visual gặp sự cố và chưa thể hoàn thiện, bạn sẽ xử lý và phối hợp với các bên liên quan như thế nào?',
      'Trong một tuần, bạn có thể dành bao nhiêu thời gian cho chương trình? Bạn có thể tham gia các buổi họp, training và hoạt động trực tiếp khi được phân công không?',
    ],
    questionsEn: [
      'Why do you want to become a Media & Communications collaborator for FTU Fashion Show 2026?',
      'Have you had experience writing content, managing a fanpage, planning communications, taking photos, or editing video? If so, please briefly describe it or attach samples.',
      "If an important post needs to go live in 2 hours but the visuals aren't ready due to an issue, how would you handle it and coordinate with everyone involved?",
      'How much time can you commit to the program each week? Can you attend meetings, training sessions, and in-person activities when assigned?',
    ],
  },
  {
    id: 'to-chuc',
    num: '03',
    name: 'Ban Tổ chức',
    nameEn: 'Organizing Team',
    color: '#34d399',
    intro: 'Ban Tổ chức phụ trách triển khai kế hoạch, chuẩn bị hậu cần và trực tiếp vận hành các hoạt động của FTU Fashion Show 2026. Đây là vị trí phù hợp với những bạn nhanh nhẹn, cẩn thận và muốn trải nghiệm công việc điều phối sự kiện thực tế.',
    introEn: 'The Organizing Team executes the plan, prepares logistics, and directly runs the operations of FTU Fashion Show 2026. This role suits anyone quick, careful, and eager to get hands-on event-coordination experience.',
    tasks: [
      'Hỗ trợ triển khai các đầu việc theo kế hoạch chung của Ban Tổ chức.',
      'Chuẩn bị hậu cần, vật tư, trang thiết bị và các nguồn lực cho chương trình.',
      'Tham gia điều phối khu vực được phân công trong quá trình diễn ra sự kiện.',
      'Quan sát, xử lý tình huống phát sinh và báo cáo kịp thời cho Leader khi cần.',
    ],
    tasksEn: [
      "Help carry out tasks according to the Organizing Team's overall plan.",
      'Prepare logistics, supplies, equipment, and other resources for the program.',
      'Help coordinate an assigned area during the event.',
      'Watch for and handle issues as they arise, and report promptly to the team lead when needed.',
    ],
    fit: [
      'Chủ động, đúng giờ, trách nhiệm và nghiêm túc với công việc.',
      'Nhanh nhẹn, nhiệt tình, có khả năng xử lý tình huống linh hoạt.',
      'Làm việc nhóm tốt và phối hợp hiệu quả trong môi trường sự kiện.',
      'Ưu tiên ứng viên từng tham gia tổ chức sự kiện ở cấp ba, đại học, câu lạc bộ hoặc dự án cộng đồng.',
    ],
    fitEn: [
      'Proactive, punctual, responsible, and serious about the work.',
      'Quick, enthusiastic, and able to handle situations flexibly.',
      'Works well in a team and coordinates effectively in a live-event environment.',
      'Experience organizing events in high school, university, clubs, or community projects is a plus.',
    ],
    questions: [
      'Vì sao bạn muốn trở thành Cộng tác viên Ban Tổ chức của FTU Fashion Show 2026?',
      'Bạn đã từng tham gia tổ chức hoạt động, sự kiện hoặc dự án nào chưa? Nếu có, hãy chia sẻ vai trò của bạn và điều bạn học được.',
      'Nếu một người mẫu đến muộn khiến timeline có nguy cơ bị ảnh hưởng, bạn sẽ xử lý như thế nào trong phạm vi vai trò của mình?',
      'Trong một tuần, bạn có thể dành bao nhiêu thời gian cho chương trình? Bạn có thể tham gia họp, training, tổng duyệt và ngày chạy sự kiện trực tiếp không?',
    ],
    questionsEn: [
      'Why do you want to become an Organizing Team collaborator for FTU Fashion Show 2026?',
      'Have you helped organize any activities, events, or projects before? If so, share your role and what you learned.',
      'If a model arrives late and puts the timeline at risk, how would you handle it within the scope of your role?',
      'How much time can you commit to the program each week? Can you attend meetings, training, rehearsals, and the live event day in person?',
    ],
  },
  {
    id: 'sang-tao',
    num: '04',
    name: 'Ban Sáng tạo',
    nameEn: 'Creative Team',
    color: '#38bdf8',
    intro: 'Ban Sáng tạo phụ trách định hình diện mạo thẩm mỹ và tinh thần hình ảnh cho FTU Fashion Show 2026. Đây là vị trí dành cho những bạn yêu thích thời trang, styling, nghệ thuật thị giác và muốn trực tiếp tham gia vào phần hình ảnh của chương trình.',
    introEn: "The Creative Team shapes the visual look and artistic spirit of FTU Fashion Show 2026. This role is for anyone who loves fashion, styling, and visual art, and wants to be directly involved in the show's visuals.",
    tasks: [
      'Tham gia xây dựng concept visual và phong cách thời trang tổng thể.',
      'Hỗ trợ phối đồ, lựa chọn trang phục, phụ kiện cho photoshoot và đêm diễn.',
      'Hỗ trợ fitting, quản lý trang phục và xử lý các vấn đề hậu trường.',
      'Phối hợp với nhà thiết kế, thương hiệu, người mẫu và các phân ban liên quan.',
    ],
    tasksEn: [
      'Help build the overall visual concept and fashion styling direction.',
      'Help style outfits and choose costumes and accessories for photoshoots and the show.',
      'Assist with fittings, manage wardrobe, and handle backstage issues.',
      'Coordinate with designers, brands, models, and other related departments.',
    ],
    fit: [
      'Có gu thẩm mỹ, yêu thích thời trang, nghệ thuật và sáng tạo hình ảnh.',
      'Cẩn thận, khéo léo, chủ động và chịu được áp lực deadline.',
      'Có khả năng làm việc nhóm và truyền đạt ý tưởng rõ ràng.',
      'Ưu tiên ứng viên có kinh nghiệm styling, thiết kế, makeup, đồ họa, dự án nghệ thuật/thời trang hoặc có portfolio.',
    ],
    fitEn: [
      'A good eye for aesthetics, with a love for fashion, art, and visual creativity.',
      'Careful, dexterous, proactive, and able to work under deadline pressure.',
      'Able to work in a team and communicate ideas clearly.',
      'Experience in styling, design, makeup, graphic design, art/fashion projects, or a portfolio is a plus.',
    ],
    questions: [
      'Vì sao bạn muốn trở thành Cộng tác viên Ban Sáng tạo của FTU Fashion Show 2026?',
      'Bạn đã từng có kinh nghiệm styling, thiết kế, makeup, đồ họa, làm mẫu hoặc tham gia dự án nghệ thuật/thời trang nào chưa? Nếu có, hãy chia sẻ ngắn gọn hoặc đính kèm portfolio.',
      'Nếu chỉ còn vài phút trước khi người mẫu ra sân khấu nhưng trang phục gặp sự cố như bung khóa, rách gấu hoặc lệch phụ kiện, bạn sẽ xử lý như thế nào?',
      'Trong một tuần, bạn có thể dành bao nhiêu thời gian cho chương trình? Bạn có thể tham gia họp, training, fitting, tổng duyệt và hoạt động trực tiếp khi được phân công không?',
    ],
    questionsEn: [
      'Why do you want to become a Creative Team collaborator for FTU Fashion Show 2026?',
      'Have you had experience in styling, design, makeup, graphic design, modeling, or any art/fashion project? If so, please briefly describe it or attach your portfolio.',
      'If a model is about to walk on stage in a few minutes but their outfit has an issue — a broken zipper, a torn hem, a misplaced accessory — how would you fix it?',
      'How much time can you commit to the program each week? Can you attend meetings, training, fittings, rehearsals, and in-person activities when assigned?',
    ],
  },
];

const BENEFITS = [
  'Được tham gia trực tiếp vào quá trình tổ chức một sự kiện thời trang quy mô lớn của sinh viên Thủ đô.',
  'Được training và làm việc trong môi trường năng động, chuyên nghiệp, có tính thực chiến cao.',
  'Được rèn luyện kỹ năng làm việc nhóm, quản lý thời gian, giao tiếp và xử lý tình huống.',
  'Có cơ hội mở rộng networking với các bạn trẻ, thương hiệu, đối tác và ekip trong lĩnh vực thời trang, truyền thông, sự kiện.',
  'Nhận Giấy chứng nhận Cộng tác viên sau khi hoàn thành tốt nhiệm vụ.',
  'Có cơ hội trở thành nhân sự nòng cốt trong các dự án tiếp theo của MFC FTU.',
];

const BENEFITS_EN = [
  'Get hands-on experience organizing a large-scale student fashion event in the capital.',
  'Receive training and work in a dynamic, professional, hands-on environment.',
  'Build teamwork, time management, communication, and problem-solving skills.',
  'Expand your network with peers, brands, partners, and crews in fashion, media, and events.',
  'Receive a Collaborator Certificate upon successful completion.',
  "Have a chance to become a core member for MFC FTU's future projects.",
];

const fieldLabelStyle = { display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 };
const errorTextStyle = { color: '#ff6b6b', fontSize: 12, margin: '6px 0 0' };

const buildInitialForm = (deptName) => ({
  name: '', dob: '', phone: '', email: '', school: '',
  department: deptName, facebook: '', portfolio: '', answers: ['', '', '', ''],
});

/* ─── Small shared bits (reusing the site's existing patterns) ─────────── */
const Breadcrumb = ({ parts }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 20 }}>
    {parts.map((p, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span style={{ opacity: .4 }}>/</span>}
        <span style={{ color: i === parts.length - 1 ? 'var(--mint)' : 'var(--muted)', fontWeight: i === parts.length - 1 ? 700 : 500 }}>{p}</span>
      </React.Fragment>
    ))}
  </div>
);

/* ─── Department card (Tab 1) ───────────────────────────────────────────── */
const DepartmentCard = ({ dept, onApply, vi }) => {
  const [showFit, setShowFit] = useState(false);

  return (
    <div className="mfc-card" style={{ padding: '26px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, color: dept.color, letterSpacing: '.2em', fontWeight: 700, marginBottom: 10 }}>
          {dept.num}
        </div>
        <h3 className="serif" style={{ color: '#fff', fontSize: 22, margin: '0 0 10px', fontWeight: 700 }}>
          {vi ? dept.name : dept.nameEn}
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.75, margin: 0 }}>
          {vi ? dept.intro : dept.introEn}
        </p>
      </div>

      <div>
        <div style={{ fontSize: 11, color: dept.color, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: 10 }}>
          {vi ? 'Bạn sẽ làm gì?' : "What you'll do"}
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(vi ? dept.tasks : dept.tasksEn).map((t, i) => (
            <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#e0dbff', lineHeight: 1.6 }}>
              <span style={{ color: dept.color, flexShrink: 0 }}>—</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowFit(s => !s)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}
        >
          {vi ? 'Phù hợp với ai?' : 'Who fits this role?'}
          <span className="material-symbols-outlined" style={{ fontSize: 16, transition: 'transform .25s', transform: showFit ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
        </button>
        <div style={{ overflow: 'hidden', maxHeight: showFit ? 400 : 0, opacity: showFit ? 1 : 0, transition: 'max-height .35s ease, opacity .3s ease', marginTop: showFit ? 10 : 0 }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(vi ? dept.fit : dept.fitEn).map((f, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
                <span style={{ color: dept.color, flexShrink: 0 }}>✦</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button className="btn-pill" onClick={() => onApply(dept.name)} style={{ marginTop: 'auto', justifyContent: 'center', width: '100%' }}>
        {vi ? 'Đăng ký ngay →' : 'Apply Now →'}
      </button>
    </div>
  );
};

/* ─── Benefits section (Tab 1) ──────────────────────────────────────────── */
const BenefitsSection = ({ vi }) => (
  <section style={{ padding: '48px 0 64px' }}>
    <div className="container">
      <div className="section-eyebrow" style={{ marginBottom: 20 }}>
        <span className="gradient-title-hero" style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          {vi ? 'Quyền lợi chung' : 'Benefits'}
        </span>
      </div>
      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 15, maxWidth: 640, margin: '0 auto 32px', lineHeight: 1.7 }}>
        {vi ? 'Khi trở thành Cộng tác viên FTU Fashion Show 2026, bạn sẽ:' : 'As an FTU Fashion Show 2026 collaborator, you will:'}
      </p>
      <div className="mfc-card recruit-benefits-grid" style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 32px' }}>
        {(vi ? BENEFITS : BENEFITS_EN).map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0', borderBottom: i < BENEFITS.length - 2 ? '1px solid var(--line)' : 'none' }}>
            <span style={{ color: 'var(--mint)', fontSize: 16, flexShrink: 0, marginTop: 1 }}>✦</span>
            <span style={{ color: '#e0dbff', fontSize: 14, lineHeight: 1.65 }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Application questions (Tab 2 — depends on selected department) ──── */
const DepartmentQuestions = ({ dept, answers, onChange, vi }) => (
  <div>
    <div style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
      {vi ? 'Câu hỏi ứng tuyển' : 'Application Questions'}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {(vi ? dept.questions : dept.questionsEn).map((q, i) => (
        <div key={i}>
          <label style={{ display: 'block', fontSize: 13, color: '#e0dbff', lineHeight: 1.6, marginBottom: 8 }}>
            {i + 1}. {q}
          </label>
          <textarea
            className="mfc-input"
            rows={3}
            placeholder={vi ? 'Nhập câu trả lời của bạn...' : 'Enter your answer...'}
            value={answers[i] || ''}
            onChange={e => onChange(i, e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>
      ))}
    </div>
  </div>
);

/* ─── Registration form (Tab 2) ─────────────────────────────────────────── */
const RegistrationForm = ({
  vi, departments, formData, setFormData, errors, setErrors,
  submitStatus, setSubmitStatus, onBack, onDepartmentChange,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const dobPickerRef = useRef(null);
  const dept = departments.find(d => d.name === formData.department) || departments[0];

  const setField = (key) => (e) => {
    const { value } = e.target;
    setFormData(f => ({ ...f, [key]: value }));
    setErrors(er => (er[key] ? { ...er, [key]: undefined } : er));
  };

  // dob is kept as a dd/mm/yyyy string; typing auto-inserts the slashes as a simple mask
  const handleDobTextChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    else if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    setFormData(f => ({ ...f, dob: formatted }));
    setErrors(er => (er.dob ? { ...er, dob: undefined } : er));
  };

  // the hidden native <input type="date"> gives a real calendar/date-picker (esp. useful on phones);
  // its ISO value is converted back into the same dd/mm/yyyy display format
  const handleDobPickerChange = (e) => {
    const iso = e.target.value; // yyyy-mm-dd
    if (!iso) return;
    const [y, m, d] = iso.split('-');
    setFormData(f => ({ ...f, dob: `${d}/${m}/${y}` }));
    setErrors(er => (er.dob ? { ...er, dob: undefined } : er));
  };

  const openDobPicker = () => {
    const el = dobPickerRef.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') el.showPicker();
    else el.focus();
  };

  const setAnswer = (idx, value) => {
    setFormData(f => {
      const answers = [...f.answers];
      answers[idx] = value;
      return { ...f, answers };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = vi ? 'Vui lòng nhập họ và tên.' : 'Please enter your full name.';
    if (!formData.dob.trim()) newErrors.dob = vi ? 'Vui lòng nhập ngày sinh.' : 'Please enter your date of birth.';
    if (!formData.phone.trim()) newErrors.phone = vi ? 'Vui lòng nhập số điện thoại.' : 'Please enter your phone number.';
    if (!formData.email.trim()) newErrors.email = vi ? 'Vui lòng nhập email.' : 'Please enter your email.';
    if (!formData.department) newErrors.department = vi ? 'Vui lòng chọn ban ứng tuyển.' : 'Please select a department.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitStatus(null);
      return;
    }
    setErrors({});
    setSubmitting(true);
    // Bundle each question alongside its answer so the admin dashboard can show both later.
    const payload = {
      ...formData,
      answers: (vi ? dept.questions : dept.questionsEn).map((q, i) => ({ question: q, answer: formData.answers[i] || '' })),
    };
    try {
      const res = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        console.log('Recruitment application:', payload);
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="mfc-card" style={{ padding: '48px 32px', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 52, color: 'var(--mint)', marginBottom: 16, display: 'block' }}>check_circle</span>
        <h3 className="serif" style={{ color: '#fff', fontSize: 24, margin: '0 0 12px' }}>
          {vi ? 'Đăng ký thành công!' : 'Application submitted!'}
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.75, maxWidth: 440, margin: '0 auto 28px' }}>
          {vi
            ? 'Bạn đã gửi đăng ký thành công. MFC FTU sẽ liên hệ với bạn trong thời gian sớm nhất.'
            : 'Your application has been submitted. MFC FTU will contact you as soon as possible.'}
        </p>
        <button type="button" className="btn-outline-pill" onClick={onBack}>
          {vi ? '← Về trang thông tin' : '← Back to info page'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mfc-card" style={{ padding: '32px 28px' }}>
      {/* Personal info */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
          {vi ? 'Thông tin cá nhân' : 'Personal Information'}
        </div>

        <div className="recruit-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={fieldLabelStyle}>{vi ? 'Họ và tên *' : 'Full Name *'}</label>
            <input className="mfc-input" value={formData.name} onChange={setField('name')} placeholder={vi ? 'Nhập họ và tên của bạn' : 'Enter your full name'} />
            {errors.name && <p style={errorTextStyle}>{errors.name}</p>}
          </div>
          <div>
            <label style={fieldLabelStyle}>{vi ? 'Ngày tháng năm sinh *' : 'Date of Birth *'}</label>
            <div style={{ position: 'relative' }}>
              <input
                className="mfc-input"
                type="text"
                inputMode="numeric"
                value={formData.dob}
                onChange={handleDobTextChange}
                placeholder="dd/mm/yyyy"
                maxLength={10}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={openDobPicker}
                aria-label={vi ? 'Chọn ngày sinh' : 'Pick date of birth'}
                style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 6, display: 'flex', alignItems: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_month</span>
              </button>
              <input
                ref={dobPickerRef}
                type="date"
                onChange={handleDobPickerChange}
                tabIndex={-1}
                aria-hidden="true"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none' }}
              />
            </div>
            {errors.dob && <p style={errorTextStyle}>{errors.dob}</p>}
          </div>
        </div>

        <div className="recruit-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={fieldLabelStyle}>{vi ? 'Số điện thoại *' : 'Phone Number *'}</label>
            <input className="mfc-input" type="tel" value={formData.phone} onChange={setField('phone')} placeholder={vi ? 'Nhập số điện thoại' : 'Enter your phone number'} />
            {errors.phone && <p style={errorTextStyle}>{errors.phone}</p>}
          </div>
          <div>
            <label style={fieldLabelStyle}>Email *</label>
            <input className="mfc-input" type="email" value={formData.email} onChange={setField('email')} placeholder={vi ? 'Nhập email' : 'Enter your email'} />
            {errors.email && <p style={errorTextStyle}>{errors.email}</p>}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={fieldLabelStyle}>{vi ? 'Trường / đơn vị học tập hoặc làm việc' : 'School / Organization'}</label>
          <input className="mfc-input" value={formData.school} onChange={setField('school')} placeholder={vi ? 'Nhập tên trường / đơn vị' : 'Enter your school / organization'} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={fieldLabelStyle}>{vi ? 'Ban ứng tuyển *' : 'Department *'}</label>
          <select
            className="mfc-input"
            value={formData.department}
            onChange={e => onDepartmentChange(e.target.value)}
            style={{ cursor: 'pointer', appearance: 'none' }}
          >
            {departments.map(d => <option key={d.id} value={d.name}>{vi ? d.name : d.nameEn}</option>)}
          </select>
          {errors.department && <p style={errorTextStyle}>{errors.department}</p>}
        </div>

        <div className="recruit-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={fieldLabelStyle}>{vi ? 'Link Facebook cá nhân' : 'Facebook Link'}</label>
            <input className="mfc-input" value={formData.facebook} onChange={setField('facebook')} placeholder="https://www.facebook.com/..." />
          </div>
          <div>
            <label style={fieldLabelStyle}>{vi ? 'Link portfolio / sản phẩm cá nhân' : 'Portfolio Link'}</label>
            <input className="mfc-input" value={formData.portfolio} onChange={setField('portfolio')} placeholder="https://..." />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{ marginBottom: 28 }}>
        <DepartmentQuestions dept={dept} answers={formData.answers} onChange={setAnswer} vi={vi} />
      </div>

      {submitStatus === 'error' && (
        <p style={{ ...errorTextStyle, textAlign: 'center', marginBottom: 12 }}>
          {vi ? 'Đã có lỗi xảy ra, vui lòng thử lại.' : 'Something went wrong, please try again.'}
        </p>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" onClick={onBack} className="btn-outline-pill" style={{ flex: '1 1 160px', justifyContent: 'center' }}>
          {vi ? '← Quay lại' : '← Back'}
        </button>
        <button type="submit" disabled={submitting} className="btn-pill" style={{ flex: '2 1 240px', justifyContent: 'center', gap: 6, opacity: submitting ? .6 : 1 }}>
          {submitting ? (vi ? 'Đang gửi...' : 'Submitting...') : (
            <>
              {vi ? 'Gửi đăng ký' : 'Submit'}
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_outward</span>
            </>
          )}
        </button>
      </div>

      <p style={{ fontSize: 12, color: 'rgba(168,150,246,.5)', textAlign: 'center', marginTop: 20, marginBottom: 0, lineHeight: 1.6 }}>
        {vi
          ? 'Lưu ý: Thông tin của bạn sẽ được bảo mật và chỉ sử dụng cho mục đích tuyển dụng CTV FTU Fashion Show 2026.'
          : 'Note: Your information is kept confidential and used only for FTU Fashion Show 2026 recruitment purposes.'}
      </p>
    </form>
  );
};

/* ─── Page ───────────────────────────────────────────────────────────── */
const RecruitPage = () => {
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'form'
  const [selectedDepartment, setSelectedDepartment] = useState(DEPARTMENTS[0].name);
  const [formData, setFormData] = useState(() => buildInitialForm(DEPARTMENTS[0].name));
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'success'

  const currentDept = DEPARTMENTS.find(d => d.name === selectedDepartment) || DEPARTMENTS[0];

  const goToForm = (deptName) => {
    setSelectedDepartment(deptName);
    setFormData(buildInitialForm(deptName));
    setErrors({});
    setSubmitStatus(null);
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDepartmentChange = (deptName) => {
    setSelectedDepartment(deptName);
    setFormData(f => ({ ...f, department: deptName, answers: ['', '', '', ''] }));
    setErrors(er => ({ ...er, department: undefined }));
  };

  const goBackToInfo = () => {
    setActiveTab('info');
    setSubmitStatus(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in" style={{ paddingTop: 96, paddingBottom: 64 }}>
      {activeTab === 'info' ? (
        <>
          <div className="container" style={{ paddingTop: 8 }}>
            <Breadcrumb parts={[vi ? 'Tuyển dụng' : 'Recruitment', vi ? 'Cộng tác viên' : 'Collaborators']} />
          </div>

          {/* Hero */}
          <section style={{ padding: '0 0 48px' }}>
            <div className="container recruit-hero" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ height: 1, width: 32, background: 'var(--mint)' }} />
                  <div style={{ fontSize: 11, color: 'var(--mint)', letterSpacing: '.24em', textTransform: 'uppercase', fontWeight: 600 }}>
                    FTU Fashion Show 2026
                  </div>
                </div>
                <h1 className="serif" style={{
                  fontSize: 'clamp(32px, 4.6vw, 56px)', lineHeight: 1.15, margin: '0 0 20px', fontWeight: 700,
                  background: 'linear-gradient(135deg, #fff 25%, var(--purple) 60%, var(--mint))',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {vi
                    ? <>MFC cần bạn —<br />Hãy trở thành một mảnh ghép của <br />FTU Fashion Show 2026</>
                    : <>MFC needs you —<br />Become part of<br />FTU Fashion Show 2026</>}
                </h1>
                <p style={{ color: '#ccc8f0', fontSize: 16, lineHeight: 1.85, maxWidth: 520, margin: '0 0 32px' }}>
                  {vi
                    ? 'Cùng đồng hành với MFC FTU trong hành trình tạo nên một mùa Fashion Show chuyên nghiệp, sáng tạo và bùng nổ.'
                    : 'Join MFC FTU on the journey to create a professional, creative, and unforgettable Fashion Show season.'}
                </p>
                <button
                  className="btn-pill btn-radiate"
                  onClick={() => document.getElementById('recruit-departments')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {vi ? 'Xem các ban ứng tuyển ↓' : 'See departments ↓'}
                </button>
              </div>

              <div style={{ position: 'relative', overflow: 'hidden', border: '1px solid rgba(168,150,246,.35)', minHeight: 380, boxShadow: '0 0 60px rgba(100,40,255,.28), 0 0 120px rgba(0,220,200,.10)' }}>
                <img
                  src="/kv-doc.jpeg"
                  alt="FTU Fashion Show 2026"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', minHeight: 380 }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(1,1,10,.55) 0%, transparent 55%)' }} />
              </div>
            </div>
          </section>

          {/* Departments */}
          <section id="recruit-departments" style={{ padding: '8px 0' }}>
            <div className="container">
              <div className="section-eyebrow" style={{ marginBottom: 32 }}>
                <span className="gradient-title-hero" style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                  {vi ? 'Thông tin ban ứng tuyển' : 'Department Information'}
                </span>
              </div>
              <div className="recruit-departments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                {DEPARTMENTS.map(dept => (
                  <DepartmentCard key={dept.id} dept={dept} onApply={goToForm} vi={vi} />
                ))}
              </div>
            </div>
          </section>

          <BenefitsSection vi={vi} />
        </>
      ) : (
        <div className="container" style={{ maxWidth: 860 }}>
          <button
            type="button"
            onClick={goBackToInfo}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, transition: 'color .2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>keyboard_backspace</span>
            {vi ? 'Trở về' : 'Back'}
          </button>

          <Breadcrumb parts={[vi ? 'Tuyển dụng' : 'Recruitment', vi ? 'Cộng tác viên' : 'Collaborators', vi ? 'Đăng ký' : 'Register']} />

          <div className="steps" style={{ justifyContent: 'flex-start', marginBottom: 24 }}>
            <div className="step-item done">
              <div className="step-num">✓</div>
              <span>{vi ? 'Chọn ban' : 'Choose department'}</span>
            </div>
            <div className="step-connector" />
            <div className="step-item active">
              <div className="step-num">2</div>
              <span>{vi ? 'Đăng ký' : 'Register'}</span>
            </div>
          </div>

          <h1 className="gradient-title" style={{ fontSize: 'clamp(24px, 3.6vw, 34px)', margin: '0 0 8px' }}>
            {vi ? `Đăng ký CTV ${currentDept.name}` : `Register for the ${currentDept.nameEn}`}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 28px', lineHeight: 1.7 }}>
            {vi
              ? `Điền đầy đủ thông tin dưới đây để hoàn tất đăng ký tham gia ${currentDept.name} của FTU Fashion Show 2026.`
              : `Fill in the information below to complete your registration for the ${currentDept.nameEn} of FTU Fashion Show 2026.`}
          </p>

          <RegistrationForm
            vi={vi}
            departments={DEPARTMENTS}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            submitStatus={submitStatus}
            setSubmitStatus={setSubmitStatus}
            onBack={goBackToInfo}
            onDepartmentChange={handleDepartmentChange}
          />
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .recruit-hero { grid-template-columns: 1fr !important; }
          .recruit-departments-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .recruit-departments-grid { grid-template-columns: 1fr !important; }
          .recruit-form-grid { grid-template-columns: 1fr !important; }
          .recruit-benefits-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default RecruitPage;
