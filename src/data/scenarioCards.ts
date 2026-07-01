import type { ScenarioCard } from '@/types/game'

export const scenarioCards: ScenarioCard[] = [
  {
    id: "startup-boom",
    title: "Khởi Nghiệp Bùng Nổ",
    description:
      "Quán tháng đầu lãi đậm 500 triệu. Bạn có rút toàn bộ 500 triệu này ra để trả góp mua Porsche mui trần phông bạt chốt sale không?",
    category: "consumerTrap",
    leftChoice: {
      label: "Không mua Porsche",
      direction: "left",
      feedback:
        "Một pha xử lý khiến các cổ đông mỉm cười. Gác sĩ diện sang một bên, giữ tiền để tiền tiếp tục sinh lời.",
      impact: { capital: 500 },
    },
    rightChoice: {
      label: "Mua Porsche",
      direction: "right",
      feedback:
        "Xe thì đẹp thật, nhưng quỹ mở rộng quán vừa bốc hơi. Bạn vừa đổi cơ hội bành trướng lấy vài vòng chạy phố.",
      impact: { capital: -500, reputation: 5 },
    },
  },
  {
    id: "generous-chairman",
    title: "Chủ Tịch Hào Phóng",
    description:
      "Kỳ này quán lãi 500 triệu. Bạn có trích 450 triệu chia đều cho nhân viên đi đu idol không?",
    category: "laborTrap",
    leftChoice: {
      label: "Không chia quá nhiều",
      direction: "left",
      feedback:
        "Hơi lạnh lùng một chút, nhưng ví tiền lại rất ấm. Lợi nhuận được giữ lại để tiếp tục sinh lời.",
      impact: { capital: 500, staffMorale: -10 },
    },
    rightChoice: {
      label: "Chia 90% lợi nhuận",
      direction: "right",
      feedback:
        "Nhân viên mở tiệc ăn mừng, còn két sắt thì trống trơn. Bạn rất có tâm... nhưng tư bản thì hơi thiếu.",
      impact: { capital: 50, staffMorale: 20, reputation: 10 },
    },
  },
  {
    id: "shark-pool-party",
    title: "Cá Mập Pool Party",
    description:
      "Shark đề nghị rót 10 tỷ nhưng bắt lấy 2 tỷ trong đó làm Pool Party PR hoành tráng. Bạn có nhận deal này không?",
    category: "growthTrap",
    leftChoice: {
      label: "Từ chối Pool Party",
      direction: "left",
      feedback:
        "Bạn không bị ánh đèn sân khấu đánh lừa. Giữ tiền cho sản xuất vẫn là nước đi khôn ngoan.",
      impact: { reputation: 5 },
    },
    rightChoice: {
      label: "Làm Pool Party",
      direction: "right",
      feedback:
        "Nhạc thì rất cháy, còn dòng tiền thì nguội hẳn. Một màn PR hoành tráng nhưng ví tiền hơi đau.",
      impact: { capital: 8000, reputation: 10 },
    },
  },
  {
    id: "maternity-leave",
    title: "Công Nhân Xin Nghỉ Sinh",
    description:
      "Nhân viên chủ lực xin nghỉ sinh mùa cao điểm. Nếu cho nghỉ, bạn phải chi 300 triệu thuê ngoài. Nếu ép làm tiếp, quán sẽ kiếm thêm 700 triệu. Bạn xử lý sao?",
    category: "ethicsTest",
    leftChoice: {
      label: "Ép làm tiếp",
      direction: "left",
      feedback:
        "Lợi nhuận tăng thật, nhưng thanh uy tín đang tụt nhanh hơn giá cổ phiếu sau scandal.",
      impact: { capital: 700, reputation: -25, staffMorale: -30 },
    },
    rightChoice: {
      label: "Cho nghỉ",
      direction: "right",
      feedback:
        "Bạn chấp nhận giảm lợi nhuận trước mắt để giữ người về lâu dài. Đôi khi uy tín còn đáng giá hơn tiền.",
      impact: { capital: -300, reputation: 15, staffMorale: 20 },
    },
  },
  {
    id: "deadline-night",
    title: "Đêm Deadline",
    description:
      "Sinh viên FPT cắm trại code xuyên đêm. Ép nhân viên làm 16 tiếng 1 ngày sẽ thu về 1 tỷ 2. Không ép thì mất 200 triệu phí đền bù hợp đồng. Bạn chọn gì?",
    category: "laborTrap",
    leftChoice: {
      label: "Không ép ca đêm",
      direction: "left",
      feedback:
        "Bạn mất một ít doanh thu, nhưng đổi lại cả đội vẫn còn đủ sức đi làm ngày mai.",
      impact: { capital: -200, staffMorale: 15 },
    },
    rightChoice: {
      label: "Ép làm 16 tiếng 1 ngày",
      direction: "right",
      feedback:
        "Doanh thu tăng vọt, còn nhân viên thì chỉ muốn biết hôm nay là thứ mấy. Giá trị thặng dư đúng là không tự nhiên mà có.",
      impact: { capital: 1200, staffMorale: -35, reputation: -10 },
    },
  },
  {
    id: "lemon-squeezer",
    title: "Máy Vắt Chanh",
    description:
      "ShopeeFood nổ 100 đơn cùng lúc. Rút giờ nghỉ trưa để ép tốc độ x3 sẽ kiếm ngay 1 tỷ. Giữ giờ nghỉ thì chỉ kiếm được 300 triệu. Ép không?",
    category: "laborTrap",
    leftChoice: {
      label: "Giữ giờ nghỉ",
      direction: "left",
      feedback:
        "Lợi nhuận tăng chậm hơn một chút, nhưng ít nhất chưa ai gửi đơn xin nghỉ việc.",
      impact: { capital: 300, staffMorale: 10 },
    },
    rightChoice: {
      label: "Rút giờ nghỉ trưa",
      direction: "right",
      feedback:
        "Đơn chạy nhanh như gió, nhưng nhân viên thì bắt đầu chạy bằng... niềm tin.",
      impact: { capital: 1000, staffMorale: -30 },
    },
  },
  {
    id: "healing-team-building",
    title: "Team Building Chữa Lành",
    description:
      "Nhân viên bất mãn phốt công ty trên group kín. Bạn có chi 200 triệu cho team building Phú Quốc để dập lửa không?",
    category: "laborTrap",
    leftChoice: {
      label: "Không tổ chức",
      direction: "left",
      feedback:
        "Bạn giữ được tiền, còn nhân viên thì giữ... cục tức. Báo động nội bộ đang nhấp nháy.",
      impact: { staffMorale: -50, reputation: -25 },
    },
    rightChoice: {
      label: "Chi tiền team building",
      direction: "right",
      feedback:
        "Mất một khoản kha khá, nhưng tinh thần cả đội vừa được sạc đầy. Muốn đi đường dài thì cũng phải bảo dưỡng con người.",
      impact: { capital: -200, staffMorale: 40, reputation: 10 },
    },
  },
  {
    id: "staff-upskill",
    title: "Đầu Tư Nâng Trình",
    description:
      "Bạn có bỏ 50 triệu mời Examiner IELTS luyện Speaking cho nhân viên để chốt đơn khách Tây không?",
    category: "growthTrap",
    leftChoice: {
      label: "Không đào tạo",
      direction: "left",
      feedback:
        "Tiết kiệm hôm nay, nhưng ngày mai khách có thể chọn quán bên cạnh.",
      impact: { reputation: -10 },
    },
    rightChoice: {
      label: "Đào tạo nhân viên",
      direction: "right",
      feedback:
        "Đầu tư vào con người chưa bao giờ là lỗ. Khách hàng hài lòng, doanh thu cũng có tương lai hơn.",
      impact: { capital: -50, profitPerTurn: 200, reputation: 5 },
    },
  },
  {
    id: "tea-robot",
    title: "Robot Ủ Trà",
    description:
      "Có người bán robot ủ trà và định lượng trân châu giá 1 tỷ. Mua về có thể giảm mạnh chi phí nhân công. Bạn mua không?",
    category: "growthTrap",
    leftChoice: {
      label: "Không mua robot",
      direction: "left",
      feedback:
        "Bạn giữ được tiền mặt, nhưng công nghệ thì không đứng yên chờ ai cả.",
      impact: { reputation: -10 },
    },
    rightChoice: {
      label: "Mua robot",
      direction: "right",
      feedback:
        "Robot vào ca, năng suất tăng thấy rõ. Đối thủ bắt đầu hơi toát mồ hôi.",
      impact: { capital: -1000, profitPerTurn: 500, staffMorale: -10, scale: 1 },
    },
  },
  {
    id: "tester-warning",
    title: "Cảnh Báo Từ Tester",
    description:
      "Tester báo app có bug áp mã 0 đồng. Vẫn release thì hỏng bét, hoãn lại để sửa bug thì mất đứt 300 triệu doanh thu hôm nay. Nghe ai?",
    category: "ethicsTest",
    leftChoice: {
      label: "Hoãn để fix",
      direction: "left",
      feedback:
        "Lùi một bước để đi xa hơn. Mất chút doanh thu nhưng giữ được cả hệ thống.",
      impact: { capital: -300, reputation: 15 },
    },
    rightChoice: {
      label: "Vẫn release",
      direction: "right",
      feedback:
        "Production không phải nơi để thử vận may. Bug vừa xuất hiện và mọi thứ bắt đầu vượt khỏi tầm kiểm soát.",
      impact: {},
      forcedPhase: "gameOver",
      gameOverEnding:
        "GAME OVER: Bug 0 đồng làm hệ thống vỡ trận và doanh nghiệp mất kiểm soát.",
    },
  },
  {
    id: "unsafe-milk-powder",
    title: "Sữa Bột 3 Không",
    description:
      "Mối buôn gạ bán sữa bột lậu giá siêu rẻ, nhập vào sẽ lãi khổng lồ 2 tỷ. Nếu từ chối và bán hàng chuẩn, chỉ lãi 300 triệu. Nhập không?",
    category: "ethicsTest",
    leftChoice: {
      label: "Từ chối nhập",
      direction: "left",
      feedback:
        "Lãi ít hơn một chút, nhưng khách hàng vẫn còn tin tưởng. Đó mới là khoản lời lâu dài.",
      impact: { capital: 300, reputation: 15 },
    },
    rightChoice: {
      label: "Nhập hàng rẻ",
      direction: "right",
      feedback:
        "Lợi nhuận nhìn thì hấp dẫn, nhưng uy tín thương hiệu vừa lao dốc không phanh.",
      impact: { capital: 2000, reputation: -60 },
    },
  },
  {
    id: "depreciation-magic",
    title: "Ma Thuật Khấu Hao",
    description:
      "Máy ép ly đã cũ, quỹ thu hồi bảo trì 200 triệu vừa giải ngân. Bạn lấy 200 triệu đó mua SH hay bỏ ra mua dàn máy mới?",
    category: "consumerTrap",
    leftChoice: {
      label: "Tái đầu tư",
      direction: "left",
      feedback:
        "Tiền được đưa trở lại sản xuất. Đúng chất một nhà kinh doanh biết nhìn đường dài.",
      impact: { scale: 1, profitPerTurn: 100 },
    },
    rightChoice: {
      label: "Lấy tiền mua SH",
      direction: "right",
      feedback:
        "Chiếc SH rất ngầu, nhưng quỹ khấu hao chắc không sinh ra vì mục đích này.",
      impact: { capital: -200, scale: -1 },
    },
  },
  {
    id: "acquire-competitor",
    title: "Cá Lớn Nuốt Cá Bé",
    description:
      "Đối thủ đang đuối vốn. Bạn có đập 5 tỷ thâu tóm toàn bộ chuỗi chi nhánh của họ không?",
    category: "growthTrap",
    leftChoice: {
      label: "Không thâu tóm",
      direction: "left",
      feedback:
        "Bạn chọn an toàn, còn đối thủ thì có thêm cơ hội quay lại cuộc chơi.",
      impact: { reputation: -10 },
    },
    rightChoice: {
      label: "Thâu tóm đối thủ",
      direction: "right",
      feedback:
        "Được ăn cả, ngã về... vẫn còn công ty. Nếu đủ lực, đây sẽ là cú bứt phá cực lớn.",
      impact: { capital: -5000, profitPerTurn: 1000, reputation: 10, scale: 2 },
      requiresCapitalAtLeast: 5000,
      failureFeedback:
        "Không đủ vốn để thâu tóm. Thương vụ biến thành gánh nợ và chuỗi trà sữa vỡ trận.",
      failureEnding:
        "GAME OVER: Vỡ nợ vì thâu tóm vượt quá năng lực tài chính.",
    },
  },
  {
    id: "all-in-expansion",
    title: "Chơi Khô Máu",
    description:
      "Bạn có cầm 15 tỷ để trực tiếp mở liền 3 mặt bằng ở ngã tư đắt đỏ nhất thành phố không?",
    category: "growthTrap",
    leftChoice: {
      label: "Không mở rộng",
      direction: "left",
      feedback:
        "Chậm mà chắc. Dù bỏ lỡ cơ hội tăng tốc, bạn vẫn giữ được thế cân bằng.",
      impact: {},
    },
    rightChoice: {
      label: "Mở 3 mặt bằng",
      direction: "right",
      feedback:
        "Chơi lớn chưa bao giờ dễ. Thành công thì thành bá chủ, thất bại thì áp lực tài chính gõ cửa.",
      impact: { capital: -15000, profitPerTurn: 2000, scale: 3 },
      requiresCapitalAtLeast: 15000,
      failureFeedback:
        "Không đủ vốn để mở 3 mặt bằng. Tiền thuê, cọc và vận hành kéo công ty rơi vào vỡ nợ.",
      failureEnding: "GAME OVER: Vỡ nợ vì mở rộng quá sức.",
    },
  },
  {
    id: "historic-exit",
    title: "Chốt Lời Lịch Sử",
    description:
      "Một quỹ đầu tư phố Wall ném 100 triệu USD để mua lại toàn bộ đế chế trà sữa của bạn, yêu cầu vốn đạt tối thiểu 5.000. Bán không?",
    category: "marketShock",
    leftChoice: {
      label: "Không bán",
      direction: "left",
      feedback:
        "Bạn chọn tiếp tục làm chủ cuộc chơi. Tiền rất hấp dẫn, nhưng cảm giác xây dựng đế chế của riêng mình còn hấp dẫn hơn.",
      impact: { reputation: 10 },
      victoryEnding:
        "Bạn giữ lại đế chế và vẫn đủ lực để tiếp tục thống trị thị trường.",
      gameOverEnding:
        "Game kết thúc: doanh nghiệp chưa đạt đủ 5.000 vốn tích lũy để được xem là chiến thắng.",
    },
    rightChoice: {
      label: "Bán cho quỹ đầu tư",
      direction: "right",
      feedback:
        "Từ một quán nhỏ đến thương vụ triệu đô. Hành trình này đáng để mở tiệc ăn mừng.",
      impact: {},
      requiresCapitalAtLeast: 5000,
      forcedPhase: "victory",
      failureFeedback: "Quy mô chưa đủ hấp dẫn để quỹ đầu tư xuống tiền.",
      failureEnding:
        "Game kết thúc: thương vụ thất bại vì vốn tích lũy chưa đạt tối thiểu 5.000.",
      victoryEnding: "VICTORY: Trở thành tỷ phú sau thương vụ mua lại lịch sử.",
    },
  },
];
