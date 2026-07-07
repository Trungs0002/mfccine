import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

const VISION = [
  {
    vi: 'Kết nối',
    en: 'Connect',
    descVi: 'Xây dựng cộng đồng sinh viên năng động, cởi mở và gắn kết, nơi mọi ý tưởng đều được lắng nghe và trân trọng.',
    descEn: 'Build a dynamic, open and bonded student community where every idea is heard and valued.',
  },
  {
    vi: 'Sáng tạo',
    en: 'Create',
    descVi: 'Khơi nguồn cảm hứng và khuyến khích sự sáng tạo trong lĩnh vực MC, thời trang, truyền thông và nghệ thuật.',
    descEn: 'Inspire and encourage creativity in MC, fashion, media and the arts.',
  },
  {
    vi: 'Phát triển',
    en: 'Grow',
    descVi: 'Trang bị kiến thức, kỹ năng và trải nghiệm thực tế để sinh viên tự tin phát triển và sẵn sàng bứt phá trong tương lai.',
    descEn: 'Equip students with knowledge, skills and real experience to grow and break through.',
  },
];

const SPECIAL = [
  {
    vi: 'Đào tạo bài bản',
    en: 'Structured Training',
    descVi: 'Các khóa học chuyên sâu về MC, Thời trang, Truyền thông và kỹ năng mềm do đội ngũ giàu kinh nghiệm trực tiếp giảng dạy.',
    descEn: 'In-depth courses on MC, Fashion, Media and soft skills taught by experienced practitioners.',
  },
  {
    vi: 'Sự kiện chất lượng',
    en: 'Quality Events',
    descVi: 'Tổ chức nhiều sự kiện, talkshow, workshop và cuộc thi sáng tạo, quy mô bài bản và chuyên nghiệp.',
    descEn: 'Organise events, talkshows, workshops and creative contests at a professional scale.',
  },
  {
    vi: 'Fashion Show đẳng cấp',
    en: 'Premium Fashion Show',
    descVi: 'Tổ chức các fashion show ấn tượng, là sân chơi để sinh viên thể hiện cá tính và khẳng định chất riêng.',
    descEn: 'Stage impressive fashion shows — the playground for students to express their identity.',
  },
  {
    vi: 'Cộng đồng truyền cảm hứng',
    en: 'Inspiring Community',
    descVi: 'Môi trường cởi mở, thân thiện, luôn sẵn sàng đồng hành và truyền cảm hứng để bạn trở thành phiên bản tốt nhất của chính mình.',
    descEn: 'An open, friendly environment that accompanies and inspires you to become your best self.',
  },
];

const TIMELINE = [
  {
    year: '2009',
    vi: 'Khởi nguồn',
    en: 'Founded',
    descVi: 'MFC được thành lập vào ngày 21/10/2009, là bệ phóng đầu tiên cho những sinh viên đam mê nghệ thuật và thời trang.',
    descEn: 'Founded on Oct 21, 2009, MFC was the first launching pad for students passionate about arts and fashion.',
  },
  {
    year: '2020',
    vi: 'Những bước đầu',
    en: 'First Steps',
    descVi: 'Tổ chức các workshop, talkshow và mini show đầu tiên, thu hút sự quan tâm của đông đảo sinh viên trong và ngoài trường.',
    descEn: 'Organised first workshops, talkshows and mini shows, attracting wide student interest.',
  },
  {
    year: '2022',
    vi: 'Mở rộng hoạt động',
    en: 'Expansion',
    descVi: 'MFC mở rộng quy mô, đa dạng hóa các hoạt động chuyên môn, đồng hành cùng nhiều đối tác và thương hiệu uy tín.',
    descEn: 'MFC scaled up, diversified professional activities and partnered with reputable brands.',
  },
  {
    year: '2024',
    vi: 'Khẳng định dấu ấn',
    en: 'Established',
    descVi: 'Tổ chức thành công các sự kiện lớn, để lại dấu ấn mạnh mẽ trong cộng đồng thời trang sinh viên khu vực phía Bắc.',
    descEn: 'Successfully hosted major events, making a strong mark in the northern student fashion scene.',
  },
  {
    year: '2026',
    vi: 'Hướng tới tương lai',
    en: 'The Future',
    descVi: 'Tiếp tục đổi mới, nâng tầm trải nghiệm và khẳng định vị thế của MFC trong bản đồ thời trang sinh viên dẫn đầu trong sinh viên.',
    descEn: 'Continue innovating, elevating the experience and solidifying MFC as a leading student fashion force.',
  },
];

const CORE_VALUES = [
  { vi: 'Bản sắc', en: 'Identity', descVi: 'Tôn vinh cá tính riêng và bản sắc thời trang độc đáo của mỗi thành viên.', descEn: 'Celebrate the unique identity and fashion style of every member.' },
  { vi: 'Kỷ luật', en: 'Discipline', descVi: 'Đề cao tinh thần trách nhiệm, chuyên nghiệp và cam kết trong mọi hoạt động.', descEn: 'Uphold responsibility, professionalism and commitment in all activities.' },
  { vi: 'Sáng tạo', en: 'Creativity', descVi: 'Không ngừng đổi mới, khuyến khích tư duy sáng tạo và dám khác biệt trong thời trang.', descEn: 'Never stop innovating, encouraging creative thinking and bold differentiation.' },
  { vi: 'Kết nối', en: 'Connection', descVi: 'Xây dựng cộng đồng gắn kết, lan tỏa giá trị tích cực và tạo nên những mối liên kết bền vững.', descEn: 'Build a cohesive community, spread positive values and forge lasting bonds.' },
];

const HIGHLIGHTS = [
  { label: 'FTU FASHION SHOW', descVi: 'Sự kiện trình diễn thời trang thường niên, bệ phóng cho người mẫu sinh viên.', descEn: 'Annual fashion show, a launchpad for student models.', pos: 'left center', img: '/sk3.jpg', link: 'https://www.facebook.com/ftufashionshow.mfc' },
  { label: 'MC FIRE',          descVi: 'Cuộc thi tìm kiếm tài năng MC chuyên nghiệp dành cho giới trẻ.', descEn: 'Professional MC talent search contest for the youth.', pos: 'center center', img: '/sk1.jpg', link: 'https://www.facebook.com/mcfire.mfc.ftu' },
  { label: 'JUST ART EXHIBITION', descVi: 'Triển lãm nghệ thuật nơi giao thoa giữa thời trang và sáng tạo.', descEn: 'Art exhibition where fashion and creativity intersect.', pos: 'right center', img: '/sk2.jpg', link: 'https://www.facebook.com/media/set/?set=a.683672377197844&type=3&rdid=cxILwUfkmIZvz9OR&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1FFDxkAgr2%2F#' },
];

const FACES = [
  { name: 'PHAN PHƯƠNG OANH', desc: 'Top 10 Hoa hậu Việt Nam 2022<br/>Miss World Vietnam 2026', img: '/phanphuongoanh.jpg' },
  { name: 'LƯƠNG THÙY LINH', desc: 'Hoa Hậu Thế Giới Việt Nam 2019', img: '/luongthuylinh.jpg' },
  { name: 'ĐỖ MỸ LINH', desc: 'Hoa Hậu Việt Nam 2016', img: '/domylinh.jpg' },
  { name: 'NGUYỄN CAO KỲ DUYÊN', desc: 'Hoa hậu Việt Nam 2014', img: '/nguyencaokyduyen.jpg' },
  { name: 'HOÀNG HƯƠNG GIANG', desc: 'Top 5 Hoa Hậu Việt Nam 2020', img: '/hoanghuonggiang.jpg' },
  { name: 'PHẠM THÙY DƯƠNG', desc: 'Top 5 Hoa Hậu Việt Nam 2024<br/>Top 15 Hoa Hậu Hòa Bình Vietnam 2024', img: '/phamthuyduong.jpg' },
  { name: 'ĐỖ THỊ HƯƠNG GIANG', desc: 'Top 5 Face of Asia 2021<br/>Á Quân 2 The New Mentor 2024', img: '/dothihuonggiang.jpg' },
  { name: 'LƯƠNG THỊ HOA ĐAN', desc: 'Á Hậu 1 Hoa Hậu Các Dân Tộc Việt Nam 2022<br/>Top 16 Miss Universe Vietnam 2024', img: '/luongthihoadan.jpg' },
  { name: 'ĐINH NGÂN HÀ', desc: 'Á hậu 1 Hoa hậu Sinh viên Việt Nam 2024', img: '/dinhngansha.jpg' },
  { name: 'NGUYỄN MINH ANH', desc: 'Hoa Khôi Duyên Dáng Ngoại Thương 2023', img: '/nguyenminhanh.jpg' },
  { name: 'LÊ PHƯƠNG QUYÊN', desc: 'Á Khôi 1 Duyên Dáng Ngoại Thương 2023<br/>Top 10 Miss World Vietnam 2026', img: '/lephuongquyen.jpg' },
  { name: 'TIÊU NGỌC LINH', desc: 'Á quân Vietnam Next Top Model 2014<br/>Top 5 Miss Universe Vietnam 2017', img: '/tieungoclinh.jpg' },
  { name: 'LÊ NGỌC NHƯ QUỲNH', desc: 'Top 6 Miss World Vietnam 2026', img: '/lengocnhuquynh.jpg' },
  { name: 'ĐINH KHÁNH HOÀ', desc: 'Top 10 Hoa hậu Việt Nam 2022', img: '/dinhkhanhhoa.jpg' },
  { name: 'TRỊNH HUYỀN MAI', desc: 'Hoa Khôi Duyên Dáng Sinh Viên Việt Nam 2023', img: '/trinhhuyenmai.jpg' },
  { name: 'NGUYỄN KHÁNH LINH', desc: 'Á Khôi 1 Duyên Dáng Sinh Viên Việt Nam 2024<br/>Top 10 Hoa Hậu Du Lịch Việt Nam 2024', img: '/nguyenkhanhlinh.jpg' },
  { name: 'CHỊ QUỲNH HOA', desc: 'MC/ BTV VTV', img: '/quynhhoa.jpg' },
  { name: 'CHỊ MINH PHƯƠNG', desc: 'MC/ BTV VTV', img: '/minhphuong.jpg' }
];

const EVENTS = [
  {
    id: "fashion-week",
    name: "FTU Fashion Show", 
    description: "FTU Fashion Show là sự kiện trình diễn thời trang thường niên do CLB MFC tổ chức, nhằm tôn vinh vẻ đẹp, phong cách và cá tính riêng của sinh viên thông qua ngôn ngữ thời trang. Đây là cơ hội để các bạn người mẫu trẻ đam mê sàn diễn được thể hiện bản lĩnh, đồng thời khẳng định tinh thần sáng tạo và chuyên nghiệp của sinh viên Ngoại thương trong lĩnh vực nghệ thuật trình diễn.",
    image: "/sk3.jpg",
    href: "https://www.facebook.com/ftufashionshow.mfc"
  },
  {
    id: "talent-show",
    name: "MC Fire", 
    description: "MC Fire là cuộc thi tìm kiếm người dẫn chương trình tài năng, hướng tới việc tạo dựng một sân chơi chuyên nghiệp dành cho các bạn sinh viên trên địa bàn Hà Nội có niềm đam mê với lĩnh vực dẫn chương trình. Thông qua các vòng thi được thiết kế bài bản, MC Fire không chỉ giúp thí sinh rèn luyện kỹ năng, phong thái sân khấu mà còn góp phần lan tỏa hình ảnh người dẫn chương trình trẻ trung, tự tin và sáng tạo trong cộng đồng sinh viên.",
    image: "/sk1.jpg",
    href: "https://www.facebook.com/mcfire.mfc.ftu"
  },
  {
    id: "charity-gala",
    name: "Just Art Exhibition", 
    description: "Just Art Exhibition là triển lãm nghệ thuật do CLB tổ chức, nhằm tạo không gian cho sinh viên thể hiện tư duy sáng tạo và cảm xúc nghệ thuật thông qua nhiều hình thức như hội họa, nhiếp ảnh và sắp đặt. Sự kiện góp phần lan tỏa tinh thần nghệ thuật, khơi dậy cảm hứng sáng tạo và xây dựng cộng đồng yêu nghệ thuật trong sinh viên Ngoại thương.",
    image: "/sk2.jpg",
    href: "https://www.facebook.com/media/set/?set=a.683672377197844&type=3&rdid=cxILwUfkmIZvz9OR&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1FFDxkAgr2%2F#"
  },
];

const CLUB_DEPARTMENTS = [
  {
    id: "ban-su-kien",
    name: "Ban Thời Trang",
    role: "Fashion",
    image: "/ban-su-kien.jpg", 
    members: [
      { position: "Trưởng ban", name: "Phạm Quỳnh Anh" },
      { position: "Phó ban", name: "Hoàng Thị Mai" },
      { position: "Model trưởng", name: "Vũ Thanh Hà" }
    ],
    color: "#a78bfa",
    description: "Là nơi quy tụ những bạn trẻ đam mê thời trang và sàn diễn, ban Thời trang mang đến môi trường để các thành viên được rèn luyện kỹ năng catwalk, phong thái biểu diễn và khả năng thể hiện cá tính trên sân khấu. Không chỉ dừng lại ở việc trình diễn, Ban còn góp phần xây dựng hình ảnh chỉn chu, chuyên nghiệp cho các sự kiện của CLB, đồng thời lan tỏa tinh thần tự tin, sáng tạo và bản lĩnh của sinh viên Ngoại thương"
  },
  {
    id: "ban-truyen-thong",
    name: "Ban MC",
    role: "MC",
    image: "/ban-truyen-thong.jpg",
    members: [
      { position: "Trưởng ban", name: "Đỗ Văn Khánh" },
      { position: "Phó ban", name: "Bùi Thị Linh" },
      { position: "MC chính", name: "Ngô Minh Tuấn" }
    ],
    color: "#f472b6",
    description: "Ban MC là môi trường năng động dành cho những bạn yêu thích lĩnh vực dẫn chương trình và mong muốn phát triển kỹ năng giao tiếp, ứng biến cùng phong thái sân khấu chuyên nghiệp. Tại đây, các thành viên được tham gia đào tạo, thực hành qua các sự kiện nội bộ, từ đó không ngừng hoàn thiện bản thân và lan tỏa hình ảnh người dẫn chương trình tự tin, bản lĩnh và truyền cảm hứng."
  },
  {
    id: "ban-dao-tao",
    name: "Ban Sáng Tạo",
    role: "Creative",
    image: "/ban-dao-tao.jpg",
    members: [
      { position: "Trưởng ban", name: "Lý Thùy Dung" },
      { position: "Phó ban", name: "Phan Minh Khôi" },
      { position: "Art Director", name: "Mai Thảo Nguyên" }
    ],
    color: "#38bdf8",
    description: "Tập hợp những cá nhân có tư duy thẩm mỹ và khả năng sáng tạo vượt giới hạn, Ban Sáng tạo đảm nhận vai trò định hình hình ảnh và phong cách đặc trưng cho CLB. Các thành viên của ban là \"linh hồn nghệ thuật\" đứng sau những sản phẩm truyền thông, visual và ý tưởng sân khấu độc đáo, góp phần tạo nên bản sắc riêng, đậm chất MFC trong mọi hoạt động"
  },
  {
    id: "ban-chu-nhiem",
    name: "Ban Tổ Chức",
    role: "Leader",
    image: "/ban-chu-nhiem.jpg",
    members: [
      { position: "Trưởng ban", name: "Nguyễn Minh Anh" },
      { position: "Phó ban", name: "Trần Thu Hường" },
      { position: "Thành viên", name: "Lê Hoàng Nam" }
    ],
    color: "#34d399",
    description: "Giữ vai trò \"bộ não điều hành\" của CLB, Ban Tổ chức chịu trách nhiệm lập kế hoạch, phân công và giám sát tiến độ để đảm bảo mọi hoạt động diễn ra đúng định hướng và hiệu quả. Với tinh thần tỉ mỉ, chủ động và trách nhiệm cao, các thành viên Ban Tổ chức là những người đứng sau góp phần tạo nên sự thành công, chuyên nghiệp và chỉn chu cho từng sự kiện của MFC"
  },
  {
    id: "ban-noi-vu",
    name: "Ban Đối Ngoại",
    role: "External",
    image: "/ban-noi-vu.jpg",
    members: [
      { position: "Trưởng ban", name: "Trần Quốc Việt" },
      { position: "Phó ban", name: "Nguyễn Thủy Tiên" },
      { position: "Partnership", name: "Lê Gia Bảo" }
    ],
    color: "#fbbf24",
    description: "Đóng vai trò cầu nối giữa CLB và các đơn vị đối tác, ban Đối ngoại phụ trách tìm kiếm, duy trì và mở rộng các mối quan hệ hợp tác chiến lược. Với tinh thần linh hoạt và khả năng giao tiếp khéo léo, các thành viên Ban Đối ngoại góp phần xây dựng hình ảnh CLB uy tín, chuyên nghiệp, đồng thời mang đến nhiều cơ hội phát triển và hợp tác cho các dự án của MFC"
  },
  {
    id: "ban-tai-chinh",
    name: "Ban Truyền Thông",
    role: "Media",
    image: "/ban-tai-chinh.jpg",
    members: [
      { position: "Trưởng ban", name: "Phạm Thu Trang" },
      { position: "Phó ban", name: "Hoàng Minh Quân" },
      { position: "Content Creator", name: "Vũ Hương Giang" }
    ],
    color: "#f87171",
    description: "Là gương mặt đại diện trong việc lan tỏa hình ảnh của CLB đến với cộng đồng, Ban Truyền thông phụ trách xây dựng nội dung, hình ảnh và chiến lược truyền thông cho các dự án, sự kiện. Mỗi sản phẩm không chỉ thể hiện tinh thần sáng tạo mà còn góp phần khẳng định thương hiệu MFC chuyên nghiệp, năng động và truyền cảm hứng đến sinh viên Ngoại thương cũng như các bạn trẻ yêu thích lĩnh vực MC và thời trang"
  }
];

const EventsSection = ({ vi }) => {
  const [activeEvent, setActiveEvent] = useState(EVENTS[0].id);
  const activeEventData = EVENTS.find((e) => e.id === activeEvent) || EVENTS[0];

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '90vh', padding: '80px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {EVENTS.map((event) => (
          <motion.div
            key={event.id}
            style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: event.id === activeEvent ? 1 : 0 }}
            animate={{ opacity: event.id === activeEvent ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <img
              src={event.image}
              alt={event.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </motion.div>
        ))}
        {/* Overlay to match project theme but lighter */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,16,44,0.9) 0%, rgba(7,8,24,0.3) 40%, rgba(14,16,44,0.7) 100%)' }} />
      </div>

      <div className="container relative z-10" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
        
        {/* Section Eyebrow */}
        <div className="section-eyebrow" style={{ margin: '0 auto 40px', width: '100%', padding: '0 16px' }}>
          <span className="gradient-title-hero" style={{ fontSize: 'clamp(20px, 4.5vw, 48px)', fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: 'transparent', WebkitTextFillColor: 'transparent' }}>
            {vi ? 'Các sự kiện chính' : 'Major Events'}
          </span>
        </div>

        {/* Content Wrapper */}
        <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto', minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.h2
              key={activeEvent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 700, color: '#fff', marginBottom: 24, letterSpacing: '-0.02em', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
            >
              {activeEventData.name}
            </motion.h2>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={activeEvent + "-desc"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
              style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(16px, 1.8vw, 20px)', lineHeight: 1.8, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
            >
              {activeEventData.description}
            </motion.p>
          </AnimatePresence>

          {/* Nút Xem Chi Tiết */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEvent + "-btn"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
              style={{ marginTop: '32px' }}
            >
              <a 
                href={activeEventData.href}
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '14px 28px',
                  textDecoration: 'none'
                }}
              >
                {vi ? 'Xem Chi Tiết' : 'View Details'}
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_outward</span>
              </a>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '48px', flexWrap: 'wrap' }}>
          {EVENTS.map((event) => (
            <button
              key={event.id}
              onClick={() => setActiveEvent(event.id)}
              style={{
                padding: '12px 28px',
                borderRadius: '100px',
                background: activeEvent === event.id ? 'var(--mint)' : 'rgba(255,255,255,0.1)',
                color: activeEvent === event.id ? '#000' : '#fff',
                border: activeEvent === event.id ? '1px solid var(--mint)' : '1px solid rgba(255,255,255,0.2)',
                fontWeight: 600,
                fontSize: '15px',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (activeEvent !== event.id) e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                if (activeEvent !== event.id) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
            >
              {event.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

const DepartmentsSection = ({ vi }) => {
  const [activeCard, setActiveCard] = useState(null);

  return (
    <section className="relative z-10" style={{ padding: '80px 0', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1536, margin: '0 auto', padding: '0 clamp(20px, 4vw, 64px)' }}>
        
        {/* Section Eyebrow */}
        <div className="section-eyebrow" style={{ margin: '0 auto 24px', width: '100%', padding: '0 16px', display: 'flex', justifyContent: 'center' }}>
          <span className="gradient-title-hero" style={{ fontSize: 'clamp(20px, 4.5vw, 40px)', fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: 'transparent', WebkitTextFillColor: 'transparent' }}>
            {vi ? 'Cơ cấu tổ chức' : 'Club Structure'}
          </span>
        </div>
        
        {/* Description */}
        <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 64px' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(16px, 1.5vw, 18px)', lineHeight: 1.6 }}>
            {vi ? 'CLB MC & Thời trang Trường ĐH Ngoại thương hiện đang hoạt động với cơ cấu 06 ban, chia thành 02 khối ban cơ bản. Mỗi ban đều là một mảnh ghép không thể tách rời, gắn kết, hỗ trợ lẫn nhau, tạo nên MFC năng động, chuyên nghiệp, sáng tạo.' : 'The MC & Fashion Club of FTU operates with 6 departments, divided into 2 basic blocks. Each department is an inseparable piece, supporting each other to create a dynamic, professional, and creative MFC.'}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CLUB_DEPARTMENTS.map((dept, index) => {
            const isActive = activeCard === dept.id;
            return (
              <motion.div
                key={dept.id}
                className="relative rounded-3xl overflow-hidden cursor-pointer"
                style={{ aspectRatio: '3/4', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => setActiveCard(isActive ? null : dept.id)}
                onMouseEnter={() => setActiveCard(dept.id)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <img 
                  src={dept.image} 
                  alt={dept.name} 
                  className={`absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] object-cover transition-transform duration-700 ease-out ${isActive ? 'scale-110' : 'scale-100'}`} 
                />
                <div 
                  className="absolute -inset-1 transition-opacity duration-500" 
                  style={{ background: 'linear-gradient(to top, rgba(9,0,12,0.98) 0%, rgba(9,0,12,0.6) 50%, transparent 100%)' }} 
                />
                <div 
                  className={`absolute -inset-1 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} 
                  style={{ background: 'linear-gradient(to top, rgba(9,0,12,1) 0%, rgba(9,0,12,0.9) 70%, transparent 100%)' }} 
                />
                
                {/* Text Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <span style={{ color: dept.color, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.9 }}>
                    {dept.role}
                  </span>
                  <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
                    {dept.name}
                  </h3>
                  
                  {/* Expandable Description */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isActive ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: '20px' }}>
                      {dept.description}
                    </p>
                    
                    {/* Members */}
                    <div className="flex flex-col gap-2">
                      {dept.members.map((member, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{member.position}</span>
                          <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{member.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const FacesCarousel = () => {
  const itemWidth = 320;
  const gap = 32;
  const itemWithGap = itemWidth + gap;

  // Multiply the array to create a wide enough runway for "infinite" scrolling
  const MULTIPLIER = 10;
  const EXTENDED_FACES = Array(MULTIPLIER).fill(FACES).flat();
  const middleIndex = Math.floor(MULTIPLIER / 2) * FACES.length;

  const [containerWidth, setContainerWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setContainerWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalWidth = EXTENDED_FACES.length * itemWithGap - gap;
  const maxDrag = Math.max(0, totalWidth - containerWidth + 48);

  const [currentIndex, setCurrentIndex] = useState(middleIndex);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const pauseTimeoutRef = useRef(null);
  const xRef = useRef(0);
  const controls = useAnimation();

  // Mobile centering logic
  const isMobile = containerWidth < 768;
  const centerPadding = (containerWidth - itemWidth) / 2;
  const mobileOffset = centerPadding - 24; // 24 is the paddingLeft on the motion.div

  const getCurrentX = (index) => {
    const baseOffset = -(index * itemWithGap);
    return isMobile ? baseOffset + mobileOffset : baseOffset;
  };

  // 1. Animate to currentIndex and handle seamless infinite wrap
  useEffect(() => {
    controls.start({
      x: getCurrentX(currentIndex),
      transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
    });

    const timeout = setTimeout(() => {
      // If user reaches near the ends of our massive array, seamlessly teleport them back to the middle
      if (currentIndex < FACES.length * 2 || currentIndex > EXTENDED_FACES.length - FACES.length * 2) {
        const normalizedIndex = (currentIndex % FACES.length) + middleIndex;
        setCurrentIndex(normalizedIndex);
        controls.set({ x: getCurrentX(normalizedIndex) });
      }
    }, 850);

    return () => clearTimeout(timeout);
  }, [currentIndex, controls]);

  // 2. Auto-scroll logic
  useEffect(() => {
    if (isUserInteracting) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, [isUserInteracting]);

  // 3. User interaction handlers
  const handleInteractionStart = () => {
    setIsUserInteracting(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
  };

  const handleInteractionEnd = () => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
      setCurrentIndex((prev) => prev + 1);
    }, 2000);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <motion.div
        style={{ display: 'flex', gap: `${gap}px`, paddingLeft: '24px', paddingRight: '24px', cursor: 'grab', width: 'max-content' }}
        drag="x"
        dragConstraints={{ left: -maxDrag, right: 0 }}
        dragElastic={0.1}
        initial={{ x: getCurrentX(middleIndex) }}
        animate={controls}
        onUpdate={(latest) => {
          xRef.current = latest.x;
        }}
        onDragStart={() => {
          document.body.style.cursor = 'grabbing';
          handleInteractionStart();
        }}
        onDragEnd={(e, info) => {
          document.body.style.cursor = '';
          // Snap to the closest card based on where they dropped it
          const draggedX = xRef.current;
          const baseDraggedX = isMobile ? draggedX - mobileOffset : draggedX;
          let closestIndex = Math.round(Math.abs(baseDraggedX) / itemWithGap);
          closestIndex = Math.max(0, Math.min(closestIndex, EXTENDED_FACES.length - 1));
          
          setCurrentIndex(closestIndex);
          handleInteractionEnd();
        }}
        onHoverStart={handleInteractionStart}
        onHoverEnd={handleInteractionEnd}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
      >
        {EXTENDED_FACES.map((face, idx) => (
          <div key={idx} style={{ flexShrink: 0, width: `${itemWidth}px`, userSelect: 'none' }} className="group">
            <div style={{ position: 'relative', aspectRatio: '4/6', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>
              <img alt={face.name} loading="lazy" decoding="async" src={face.img} style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, objectFit: 'cover', transition: 'transform 0.5s ease' }} className="group-hover:scale-105" draggable={false} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', transition: 'background 0.3s ease' }} className="group-hover:bg-black/40"></div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px', color: '#fff', textShadow: 'rgba(0, 0, 0, 0.8) 2px 2px 4px', fontFamily: '"Cormorant Garamond", "Cormorant SC", serif' }}>
                {face.name}
              </h3>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', textShadow: 'rgba(0, 0, 0, 0.7) 1px 1px 3px', fontFamily: '"Cormorant Garamond", "Cormorant SC", serif', margin: 0, lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: face.desc }} />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const AboutPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  return (
    <div className="animate-fade-in" style={{ paddingTop: 96, paddingBottom: 64 }}>

      {/* ── TOP HORIZONTAL TITLE ─────────────────────────────────────────────── */}
      <div className="container" style={{ paddingBottom: 'clamp(4px, 1.5vw, 12px)', marginBottom: 'clamp(8px, 2vw, 24px)', overflow: 'hidden' }}>
        <div className="section-eyebrow" style={{ marginBottom: 0 }}>
          <span className="gradient-title-hero" style={{ fontSize: 'clamp(11px, 2.2vw, 24px)', letterSpacing: '.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: 'transparent', WebkitTextFillColor: 'transparent' }}>
            {vi ? 'CLB MC & Thời Trang Trường Đại Học Ngoại Thương' : 'MC & Fashion Club of Foreign Trade University'}
          </span>
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ padding: '0 0 60px' }}>
        <div className="about-hero-grid" style={{ maxWidth: 1536, margin: '0 auto', padding: '0 clamp(20px, 4vw, 64px)', display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 'clamp(40px, 6vw, 100px)', alignItems: 'center' }}>
          {/* KV image left */}
          <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(168,150,246,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(168,150,246,0.1)' }}>
            <img
              src="/mfcanhchinh.jpg"
              alt="MFC Family"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(70,69,215,.05), rgba(1,1,10,.2))', pointerEvents: 'none' }} />
          </div>

          {/* Text right */}
          <div style={{ paddingRight: 'clamp(0px, 3vw, 32px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ height: 1, width: 32, background: 'var(--mint)' }} />
              <div style={{ fontSize: 12, color: 'var(--mint)', letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 600 }}>
                {vi ? 'Giới thiệu' : 'About'}
              </div>
            </div>
            <h1 className="gradient-title-hero" style={{ fontSize: 'clamp(32px, 3.8vw, 48px)', lineHeight: 1.15, margin: '0 0 24px', fontWeight: 700, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              "WE ARE MFC - WE ARE FAMILY"
            </h1>
            <p style={{ fontSize: 'clamp(15px, 1.8vw, 17px)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, marginBottom: 24, textAlign: 'justify', fontWeight: 300 }}>
              {vi ? 'CLB MC & Thời trang Trường ĐH Ngoại thương - MFC FTU thuộc khối CLB sở thích trực thuộc Đoàn sinh viên Trường ĐH Ngoại Thương. Được thành lập ngày 21/10/2009, trải qua 16 năm hình thành và phát triển.' : 'MFC is a dynamic hub for students passionate about MCing, modeling, and media. Here, every individual is empowered to step into the spotlight and express their unique identity.'}
            </p>
            {vi && (
              <p style={{ fontSize: 'clamp(15px, 1.8vw, 17px)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, marginBottom: 40, textAlign: 'justify', fontWeight: 300 }}>
                Luôn vượt qua mọi giới hạn, vượt qua mọi khuôn phép. Tập thể CLB hướng tới sự chuyên nghiệp, mang đậm tinh thần sức sống sinh viên trẻ với những dấu ấn trong lĩnh vực thời trang, nghệ thuật và dẫn chương trình.
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn-pill"
                onClick={() => window.open('https://www.facebook.com/mfc.ftu/', '_blank')}
                style={{ alignSelf: 'flex-start', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {vi ? 'Ghé thăm Fanpage' : 'Visit Fanpage'}
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_outward</span>
              </button>
              <button className="btn-outline-pill" onClick={() => { navigate('/recruit'); window.scrollTo(0, 0); }}>
                {vi ? 'Tham gia MFC →' : 'Join MFC →'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── GƯƠNG MẶT TIÊU BIỂU ─────────────────────────────── */}
      <section className="relative z-10" style={{ padding: '0 0 60px', overflow: 'hidden' }}>
        <div style={{ marginBottom: '64px' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <div className="section-eyebrow" style={{ margin: '0 auto 24px', width: '100%', padding: '0 16px' }}>
              <span className="gradient-title-hero" style={{ fontSize: 'clamp(20px, 4.5vw, 48px)', fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: 'transparent', WebkitTextFillColor: 'transparent' }}>
                {vi ? 'Gương mặt tiêu biểu' : 'Outstanding Faces'}
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(16px, 1.5vw, 18px)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
              {vi 
                ? 'Những gương mặt tài năng của CLB MC & Thời trang, đại diện cho tinh thần và sức sống của tập thể MFC FTU.' 
                : 'The talented faces of the MC & Fashion Club, representing the spirit and vitality of MFC FTU.'}
            </p>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <FacesCarousel />
        </div>
      </section>

      {/* ── CÁC SỰ KIỆN CHÍNH (Từ mfc-main) ────────────────────────── */}
      <EventsSection vi={vi} />

      {/* ── CƠ CẤU CLB ────────────────────────────────────────────── */}
      <DepartmentsSection vi={vi} />

      <style>{`
        @media (max-width: 900px) {
          .about-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
