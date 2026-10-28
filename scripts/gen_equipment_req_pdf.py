# -*- coding: utf-8 -*-
"""生成《某型装备研制总要求》约 48 页 PDF（文档平台演示样例）。"""

from __future__ import annotations

import os
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    ListFlowable,
    ListItem,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "samples" / "某型装备研制总要求.pdf"

FONT_SONG = "C:/Windows/Fonts/simsun.ttc"
FONT_HEI = "C:/Windows/Fonts/simhei.ttf"
FONT_KAI = "C:/Windows/Fonts/simkai.ttf"
FONT_FANG = "C:/Windows/Fonts/simfang.ttf"

pdfmetrics.registerFont(TTFont("SimSun", FONT_SONG, subfontIndex=0))
pdfmetrics.registerFont(TTFont("SimHei", FONT_HEI))
pdfmetrics.registerFont(TTFont("SimKai", FONT_KAI))
pdfmetrics.registerFont(TTFont("SimFang", FONT_FANG))


def styles():
    s = getSampleStyleSheet()
    s.add(
        ParagraphStyle(
            name="CoverSecret",
            fontName="SimHei",
            fontSize=14,
            leading=22,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#8B0000"),
        )
    )
    s.add(
        ParagraphStyle(
            name="CoverTitle",
            fontName="SimHei",
            fontSize=28,
            leading=42,
            alignment=TA_CENTER,
            spaceBefore=12,
            spaceAfter=12,
        )
    )
    s.add(
        ParagraphStyle(
            name="CoverSub",
            fontName="SimKai",
            fontSize=16,
            leading=28,
            alignment=TA_CENTER,
        )
    )
    s.add(
        ParagraphStyle(
            name="CoverMeta",
            fontName="SimSun",
            fontSize=12,
            leading=22,
            alignment=TA_CENTER,
        )
    )
    s.add(
        ParagraphStyle(
            name="H1",
            fontName="SimHei",
            fontSize=16,
            leading=28,
            alignment=TA_CENTER,
            spaceBefore=18,
            spaceAfter=12,
        )
    )
    s.add(
        ParagraphStyle(
            name="H2",
            fontName="SimHei",
            fontSize=13,
            leading=22,
            alignment=TA_LEFT,
            spaceBefore=14,
            spaceAfter=8,
        )
    )
    s.add(
        ParagraphStyle(
            name="H3",
            fontName="SimHei",
            fontSize=11.5,
            leading=20,
            alignment=TA_LEFT,
            spaceBefore=10,
            spaceAfter=6,
        )
    )
    s.add(
        ParagraphStyle(
            name="Body",
            fontName="SimSun",
            fontSize=10.5,
            leading=20,
            alignment=TA_JUSTIFY,
            firstLineIndent=21,
            spaceBefore=2,
            spaceAfter=2,
        )
    )
    s.add(
        ParagraphStyle(
            name="BodyNoIndent",
            fontName="SimSun",
            fontSize=10.5,
            leading=20,
            alignment=TA_JUSTIFY,
            spaceBefore=2,
            spaceAfter=2,
        )
    )
    s.add(
        ParagraphStyle(
            name="Clause",
            fontName="SimSun",
            fontSize=10.5,
            leading=20,
            alignment=TA_JUSTIFY,
            firstLineIndent=0,
            leftIndent=0,
            spaceBefore=3,
            spaceAfter=3,
        )
    )
    s.add(
        ParagraphStyle(
            name="TableCell",
            fontName="SimSun",
            fontSize=9,
            leading=14,
            alignment=TA_CENTER,
        )
    )
    s.add(
        ParagraphStyle(
            name="TableCellLeft",
            fontName="SimSun",
            fontSize=9,
            leading=14,
            alignment=TA_LEFT,
        )
    )
    s.add(
        ParagraphStyle(
            name="Caption",
            fontName="SimSun",
            fontSize=9.5,
            leading=16,
            alignment=TA_CENTER,
            spaceBefore=6,
            spaceAfter=8,
        )
    )
    s.add(
        ParagraphStyle(
            name="Footer",
            fontName="SimSun",
            fontSize=9,
            leading=12,
            alignment=TA_CENTER,
        )
    )
    s.add(
        ParagraphStyle(
            name="TOC",
            fontName="SimSun",
            fontSize=11,
            leading=22,
            alignment=TA_LEFT,
        )
    )
    s.add(
        ParagraphStyle(
            name="Note",
            fontName="SimKai",
            fontSize=9.5,
            leading=16,
            alignment=TA_LEFT,
            leftIndent=21,
            spaceBefore=4,
            spaceAfter=4,
        )
    )
    return s


ST = styles()


def p(text: str, style="Body"):
    return Paragraph(text.replace("\n", "<br/>"), ST[style])


def h1(text: str):
    return Paragraph(text, ST["H1"])


def h2(text: str):
    return Paragraph(text, ST["H2"])


def h3(text: str):
    return Paragraph(text, ST["H3"])


def clause(num: str, text: str):
    return Paragraph(f"<b>{num}</b>　{text}", ST["Clause"])


def make_table(headers, rows, col_widths=None):
    data = [[Paragraph(str(c), ST["TableCell"]) for c in headers]]
    for r in rows:
        data.append(
            [
                Paragraph(str(c), ST["TableCellLeft"] if i == 0 else ST["TableCell"])
                for i, c in enumerate(r)
            ]
        )
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "SimSun"),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8E8E8")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#444444")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return t


PAGE_STATE = {"page": 0, "total_hint": 48}


def header_footer(canvas, doc):
    canvas.saveState()
    page = doc.page
    # skip cover page header numbering style
    if page >= 2:
        canvas.setFont("SimSun", 9)
        canvas.setFillColor(colors.HexColor("#333333"))
        w, h = A4
        canvas.drawCentredString(w / 2, h - 1.2 * cm, "某型装备研制总要求")
        canvas.setStrokeColor(colors.HexColor("#666666"))
        canvas.setLineWidth(0.6)
        canvas.line(2.2 * cm, h - 1.45 * cm, w - 2.2 * cm, h - 1.45 * cm)
        canvas.line(2.2 * cm, 1.5 * cm, w - 2.2 * cm, 1.5 * cm)
        # page number (正文从第 3 页起可按需要；这里统一显示物理页码)
        canvas.drawCentredString(w / 2, 0.9 * cm, f"— {page} —")
        canvas.setFont("SimHei", 8)
        canvas.setFillColor(colors.HexColor("#8B0000"))
        canvas.drawString(2.2 * cm, 0.9 * cm, "内部")
        canvas.drawRightString(w - 2.2 * cm, 0.9 * cm, "YS-ZB-ZY-2024")
    canvas.restoreState()


def cover_page():
    story = []
    story.append(Spacer(1, 1.2 * cm))
    story.append(p("内　部", "CoverSecret"))
    story.append(Spacer(1, 2.2 * cm))
    story.append(p("某型装备研制总要求", "CoverTitle"))
    story.append(Spacer(1, 0.6 * cm))
    story.append(p("（试行稿）", "CoverSub"))
    story.append(Spacer(1, 3.5 * cm))
    meta = [
        "文件编号：YS-ZB-ZY-2024-001",
        "密　　级：内部",
        "版　　次：V1.0",
        "编制单位：某装备试验鉴定中心",
        "编制日期：2024年10月",
    ]
    for line in meta:
        story.append(p(line, "CoverMeta"))
        story.append(Spacer(1, 0.15 * cm))
    story.append(Spacer(1, 2.5 * cm))
    story.append(p("ZB试验鉴定数智化示范工程", "CoverSub"))
    story.append(p("领域文档自动编写与审校平台 · 演示样例", "CoverMeta"))
    story.append(PageBreak())
    return story


def toc_page():
    story = [h1("目　录"), Spacer(1, 0.4 * cm)]
    items = [
        ("1　范围", "3"),
        ("2　引用文件", "4"),
        ("3　术语、定义和缩略语", "5"),
        ("4　总则", "7"),
        ("5　任务与使用要求", "9"),
        ("6　系统组成与总体方案", "12"),
        ("7　主要战术技术指标", "15"),
        ("8　功能要求", "18"),
        ("9　性能要求", "21"),
        ("10　可靠性、维修性、保障性、测试性与安全性", "26"),
        ("11　环境适应性与电磁兼容性", "30"),
        ("12　信息化与软件要求", "33"),
        ("13　人机工程与标准化", "36"),
        ("14　质量保证与风险管理", "38"),
        ("15　试验与鉴定要求", "40"),
        ("16　研制阶段与进度节点", "43"),
        ("17　附录", "45"),
    ]
    for title, page in items:
        dots = "." * max(4, 52 - len(title) - len(page))
        story.append(p(f"{title} {dots} {page}", "TOC"))
    story.append(PageBreak())
    return story


def expand(paragraphs: list[str]) -> list:
    return [p(t) for t in paragraphs]


def chapter_1():
    story = [
        h1("1　范围"),
        h2("1.1　主题内容"),
        p(
            "本文件规定了某型装备（以下简称“本装备”）研制的总体目标、任务使命、系统组成、"
            "主要战术技术指标、功能与性能要求、可靠性维修性保障性测试性安全性（以下简称“五性”）要求、"
            "环境适应性与电磁兼容性、信息化与软件、人机工程与标准化、质量保证与风险管理、"
            "试验与鉴定以及研制阶段划分与进度节点等基本要求。"
        ),
        p(
            "本文件是本装备论证、方案设计、工程研制、设计定型、生产定型及后续改进改型的基本依据，"
            "也是编制系统设计规范、试验大纲、鉴定大纲、质量计划及各类技术状态文件的上位文件。"
        ),
        h2("1.2　适用范围"),
        p(
            "本文件适用于承研单位、总体单位、分系统承制单位、软件承制单位、试验鉴定机构和用户代表"
            "在本装备全寿命周期内开展的论证、设计、试制、试验、鉴定、验收及技术状态管理活动。"
        ),
        p(
            "本文件提出的指标与要求，凡标注“应”的为强制性要求，标注“宜”的为推荐性要求，"
            "标注“可”的为允许性要求。未标注程度词的条款，按强制性要求执行。"
        ),
        h2("1.3　文件效力"),
        clause(
            "1.3.1",
            "本文件与上级批准的立项批复、研制任务书不一致时，以上级批准文件为准，并及时修订本文件。",
        ),
        clause(
            "1.3.2",
            "本文件与国家标准、国家军用标准、行业标准不一致时，除另有规定外，执行较严要求；"
            "确需放宽的，应履行偏离许可或指标调整审批程序。",
        ),
        clause(
            "1.3.3",
            "分系统研制要求、接口控制文件、软件需求规格说明等下位文件不得降低本文件规定的指标门槛。",
        ),
        h2("1.4　修订管理"),
        p(
            "本文件实行受控修订。修订应由总体单位提出，经用户、试验鉴定机构和有关专家评审，"
            "报主管部门批准后实施。修订应保留修订记录、变更理由、影响分析及追溯关系。"
        ),
        PageBreak(),
    ]
    return story


def chapter_2():
    story = [
        h1("2　引用文件"),
        p(
            "下列文件对于本文件的应用是必不可少的。凡是注日期的引用文件，仅注日期的版本适用于本文件；"
            "凡是不注日期的引用文件，其最新版本（包括所有的修改单）适用于本文件。",
            "BodyNoIndent",
        ),
        Spacer(1, 0.3 * cm),
    ]
    refs = [
        "GB/T 19001　质量管理体系　要求",
        "GB/T 24001　环境管理体系　要求及使用指南",
        "GJB 9001　质量管理体系要求",
        "GJB 1362A　军工产品定型程序和要求",
        "GJB 450A　装备可靠性工作通用要求",
        "GJB 368B　装备维修性工作通用要求",
        "GJB 3872　装备综合保障通用要求",
        "GJB 2547A　装备测试性工作通用要求",
        "GJB 900A　装备安全性工作通用要求",
        "GJB 150A　军用装备实验室环境试验方法",
        "GJB 151B　军用设备和分系统电磁发射和敏感度要求与测量",
        "GJB 438B　军用软件开发文档通用要求",
        "GJB 2786A　军用软件开发通用要求",
        "GJB 5000B　军用软件研制能力成熟度模型",
        "GJB 3206A　技术状态管理",
        "GJB 1269A　工艺评审",
        "GJB 1310A　设计评审",
        "GJB 1712A　试制过程质量评审",
        "GJB 2116　武器装备研制项目工作分解结构",
        "GJB/Z 768A　故障树分析指南",
        "GJB/Z 1391　故障模式、影响及危害性分析指南",
        "QB/NY-SY-01　ZB试验鉴定通用技术条件（示范）",
        "QB/NY-SY-02　ZB田间试验方法（示范）",
        "QB/NY-SY-03　ZB可靠性试验与评价方法（示范）",
    ]
    for r in refs:
        story.append(p(r, "BodyNoIndent"))
    story.append(Spacer(1, 0.4 * cm))
    story.append(
        p(
            "注：带“QB/NY-SY”前缀的文件为领域示范工程配套技术条件，用于支撑文档审校规则库与术语对齐，"
            "正式工程实施时以主管部门发布文本为准。"
        )
    )
    story.append(PageBreak())
    return story


def chapter_3():
    story = [
        h1("3　术语、定义和缩略语"),
        h2("3.1　术语和定义"),
        h3("3.1.1　某型装备"),
        p(
            "指按本文件要求研制、用于完成既定作业/试验鉴定任务的整机系统及其配套分系统、软件、"
            "保障设备和技术资料的总称。"
        ),
        h3("3.1.2　研制总要求"),
        p(
            "规定装备研制目标、任务、主要战术技术指标及约束条件的纲领性技术文件，是开展方案论证、"
            "工程研制和试验鉴定的基本依据。"
        ),
        h3("3.1.3　战术技术指标"),
        p(
            "表征装备完成任务能力、系统性能、使用保障特性及约束条件的一组可验证指标，"
            "包括功能指标、性能指标、五性指标、环境适应性指标等。"
        ),
        h3("3.1.4　技术状态基线"),
        p(
            "在研制过程中正式确认的技术状态文件集合，包括功能基线、分配基线和产品基线。"
        ),
        h3("3.1.5　关键特性"),
        p(
            "若不符合规定要求，将直接危及人身安全、导致装备丧失主要功能或造成重大经济损失的特性。"
        ),
        h3("3.1.6　重要特性"),
        p(
            "若不符合规定要求，将导致装备主要功能下降、可靠性显著降低或维修保障显著困难的特性。"
        ),
        h3("3.1.7　试验鉴定"),
        p(
            "为考核装备是否满足研制总要求及有关标准，按规定程序组织的试验、检验、评审和结论活动。"
        ),
        h3("3.1.8　知识驱动生成"),
        p(
            "依托领域资源库、本体与规则库，按提纲与模板自动或半自动生成文档初稿，并保留条款溯源关系的过程。"
            "（本条用于演示文档平台生成与溯源能力，不改变本文件技术条款效力。）"
        ),
        h2("3.2　缩略语"),
    ]
    abbr = [
        ("WBS", "工作分解结构"),
        ("TEMP", "试验与评价主计划"),
        ("ICD", "接口控制文件"),
        ("SRS", "软件需求规格说明"),
        ("FMEA", "故障模式与影响分析"),
        ("FTA", "故障树分析"),
        ("BIT", "机内测试"),
        ("MTBF", "平均故障间隔时间"),
        ("MTTR", "平均修复时间"),
        ("PDR", "初步设计评审"),
        ("CDR", "详细设计评审"),
        ("TRR", "试验就绪评审"),
        ("OCR", "光学字符识别"),
        ("MCP", "模型上下文协议（示范工程）"),
    ]
    story.append(
        make_table(
            ["缩略语", "含义"],
            abbr,
            col_widths=[4 * cm, 12 * cm],
        )
    )
    story.append(p("表 1　缩略语", "Caption"))
    story.append(PageBreak())

    # more terminology for length
    story.append(h2("3.3　术语使用约定"))
    story.extend(
        expand(
            [
                "本文件中“装备”“整机”“系统”在未特别注明时，均指某型装备整机系统；“分系统”指动力、行走、作业、"
                "测控、通信、保障等相对独立的功能单元。",
                "涉及量值的条款，除另有说明外，均指在标准大气条件、规定工况及额定负载条件下测得的数值。"
                "允差未给出时，按相关标准或设计规范执行。",
                "涉及“不低于”“不大于”“优于”等表述时，判定以计量溯源有效的测试数据为准。"
                "统计类指标给出置信度要求的，按相应置信水平评定。",
                "文档、图纸、软件版本号采用“主版本.次版本.修订号”三段式编码；受控文件更改应同步更新版本标识与更改单号。",
            ]
        )
    )
    story.append(h2("3.4　领域术语清单（节选）"))
    terms = [
        ("试验因子", "影响试验结果的可控或不可控变量，设计平台要求不少于 20 个主要因子。"),
        ("履历图谱", "以装备—指标—试验—事件为主线的知识图谱表达。"),
        ("探针定位", "基于结构/非结构融合的故障或异常根因语义定位。"),
        ("跨文档审查", "对总要求、大纲、报告等多类文书的一致性联合审查。"),
        ("原子条款", "可独立引用、审核与版本管理的最小规范语句单元。"),
        ("技术状态项", "需要单独进行技术状态管理的硬件、软件或成套资料。"),
        ("偏离", "在规定条件下对已批准要求的暂时性不符合。"),
        ("豁免", "经批准对某项要求永久或阶段性不予执行。"),
        ("鉴定试验", "为证明产品满足规定要求而进行的正式试验。"),
        ("定型", "确认产品达到规定战术技术指标并批准转入下一阶段的活动。"),
    ]
    for name, defn in terms:
        story.append(h3(name))
        story.append(p(defn))
    story.append(PageBreak())
    return story


def chapter_4():
    story = [
        h1("4　总则"),
        h2("4.1　研制目标"),
        p(
            "研制形成功能完备、性能达标、五性协调、信息化程度高、可试验可鉴定可保障的某型装备，"
            "满足用户提出的任务使命与使用要求，支撑领域试验鉴定业务标准化、数字化、智能化转型。"
        ),
        clause(
            "4.1.1",
            "形成可复制的研制与鉴定技术体系，关键过程数据可归集、可追溯、可审计。",
        ),
        clause(
            "4.1.2",
            "主要战术技术指标一次设计定型达标率目标不低于 90%，遗留问题应有闭环计划。",
        ),
        clause(
            "4.1.3",
            "建立与资源库、训推平台、智能体编排平台及五大业务平台的数据接口与知识回流机制。",
        ),
        h2("4.2　指导思想"),
        p(
            "坚持需求牵引、指标刚性、体系配套、质量至上；坚持标准化、模块化、系列化；"
            "坚持数字样机与实物样机相结合、仿真试验与实物试验相结合、室内试验与外场试验相结合。"
        ),
        h2("4.3　基本原则"),
        clause("4.3.1", "继承与创新相结合，优先采用成熟技术和货架产品，关键新技术应完成风险消减。"),
        clause("4.3.2", "软硬协同，软件定义功能的部分应具备可配置、可升级、可回退能力。"),
        clause("4.3.3", "安全保密与开放协同并重，内部资料按密级管理，对外接口最小化授权。"),
        clause("4.3.4", "全寿命费用可控，在满足指标前提下优化研制、生产、使用与保障费用。"),
        h2("4.4　约束条件"),
        p(
            "研制应在批准的经费、周期、配套条件和法规标准框架内实施。采用国产化器件、自主可控软件"
            "和可信供应链的比例应满足主管部门当年要求；关键元器件应有双岗或替代方案。"
        ),
        h2("4.5　相关方职责（摘要）"),
    ]
    roles = [
        ("用户", "提出使用需求，参加评审与鉴定，确认重大技术状态变更。"),
        ("总体单位", "负责系统总体、指标分解、技术状态与接口控制、综合集成。"),
        ("分系统承制单位", "按分配要求完成设计、试制、试验并交付合格产品与资料。"),
        ("软件承制单位", "按软件工程要求完成研制、测评、配置管理与维护支持。"),
        ("试验鉴定机构", "编制/审查大纲，组织试验，给出鉴定意见与风险提示。"),
        ("质量部门", "监督质量体系运行，组织质量评审与问题归零。"),
    ]
    story.append(
        make_table(
            ["相关方", "主要职责"],
            roles,
            col_widths=[3.5 * cm, 12.5 * cm],
        )
    )
    story.append(p("表 2　相关方职责摘要", "Caption"))
    story.append(PageBreak())
    return story


def chapter_5():
    story = [
        h1("5　任务与使用要求"),
        h2("5.1　使命任务"),
        p(
            "本装备主要用于完成规定地域、规定工况下的作业试验、性能考核、故障复现与数据采录任务，"
            "并为鉴定结论提供可追溯的原始数据与分析报告支撑。"
        ),
        h2("5.2　使用环境与对象"),
        clause("5.2.1", "适用地域：平原、丘陵及有限坡度旱地/田间道路，具体海拔与坡度见第 11 章。"),
        clause("5.2.2", "适用对象：与本装备配套的作业装置、传感器组件及被测样机接口对象。"),
        clause("5.2.3", "使用人员：经培训合格的操作员、试验员与维护人员，编制按保障方案执行。"),
        h2("5.3　典型任务剖面"),
        p(
            "典型任务剖面包括：准备与点检、转运与部署、作业执行、数据采集与回传、维护保养、"
            "故障处置与撤收。各剖面时间比例用于可靠性预计、消耗品测算与试验科目设计。"
        ),
    ]
    profile = [
        ("准备与点检", "8%", "油液、紧固件、传感器、通信链路检查"),
        ("转运与部署", "12%", "公路/田间道路机动，展开作业装置"),
        ("作业执行", "55%", "额定工况连续作业及变工况切换"),
        ("数据采集与回传", "10%", "本地存储、边缘处理、远程同步"),
        ("维护保养", "10%", "日常保养、定检、易损件更换"),
        ("故障处置与撤收", "5%", "隔离、修复、安全撤收"),
    ]
    story.append(
        make_table(
            ["剖面", "时间占比", "主要内容"],
            profile,
            col_widths=[3.5 * cm, 2.5 * cm, 10 * cm],
        )
    )
    story.append(p("表 3　典型任务剖面", "Caption"))
    story.append(h2("5.4　使用方式"))
    story.extend(
        expand(
            [
                "本装备可单机独立作业，也可编组协同作业。编组模式下应支持任务分配、状态共享与冲突避让。"
                "远程监视与有限远程控制功能应可裁剪配置。",
                "连续作业能力应满足单班不少于规定时长；跨班交接应保证数据完整与状态连续。"
                "夜间作业应满足照明与标识要求，并具备必要的安全联锁。",
            ]
        )
    )
    story.append(h2("5.5　保障与部署要求"))
    story.extend(
        expand(
            [
                "伴随保障设备应随装配置，包括专用工具、检测设备、备件与技术资料。"
                "仓库贮存、运输加固与启封检查要求见综合保障大纲。",
                "部署展开时间、撤收时间应满足表 4 规定；特殊地形下的放宽条件应在试验大纲中明确。",
            ]
        )
    )
    deploy = [
        ("标准地形展开", "≤ 30 min", "自到达作业点起至具备作业条件"),
        ("标准地形撤收", "≤ 25 min", "自收到撤收指令起至具备转运条件"),
        ("公路转运平均速度", "≥ 40 km/h", "二级及以上公路，遵守交通法规"),
        ("田间道路平均速度", "≥ 15 km/h", "可通行田间道路，安全为前提"),
    ]
    story.append(
        make_table(
            ["项目", "指标", "说明"],
            deploy,
            col_widths=[4 * cm, 3.5 * cm, 8.5 * cm],
        )
    )
    story.append(p("表 4　部署与转运要求", "Caption"))
    story.append(h2("5.6　训练与人机协同"))
    story.append(
        p(
            "应提供操作训练大纲、模拟训练手段（可含数字孪生或半实物仿真）及考核标准。"
            "新人独立上岗前应完成规定学时与实操考核。智能辅助功能不得削弱操作员对安全关键动作的最终确认权。"
        )
    )
    story.append(PageBreak())
    return story


def chapter_6():
    story = [
        h1("6　系统组成与总体方案"),
        h2("6.1　系统组成"),
        p(
            "本装备由动力分系统、行走与底盘分系统、作业执行分系统、测控与传感分系统、"
            "通信与导航分系统、显控与信息分系统、保障设备及技术资料等组成。"
        ),
    ]
    comps = [
        ("动力分系统", "动力源、传动、冷却、燃油/电能管理"),
        ("行走与底盘", "车架、悬架、轮胎/履带、制动与转向"),
        ("作业执行", "作业装置、液压/电气驱动、快速挂接"),
        ("测控与传感", "工况传感、力/位移/转速/温度等采集"),
        ("通信与导航", "无线链路、定位定向、时统"),
        ("显控与信息", "人机界面、记录仪、边缘计算单元"),
        ("保障设备", "工具、备件、检测仪、运输托架"),
        ("技术资料", "说明书、图纸、软件介质、鉴定资料"),
    ]
    story.append(
        make_table(
            ["分系统", "主要内容"],
            comps,
            col_widths=[4 * cm, 12 * cm],
        )
    )
    story.append(p("表 5　系统组成", "Caption"))
    story.append(h2("6.2　总体技术方案"))
    story.extend(
        expand(
            [
                "总体方案采用“平台 + 模块 + 软件”架构。机械平台提供动力、行走与承载；作业模块可快速更换；"
                "软件通过配置项管理实现功能裁剪与版本升级。",
                "信息架构采用边缘侧实时控制与中心侧数据汇聚相结合。边缘侧保证控制时延与安全联锁；"
                "中心侧支持试验数据治理、知识入库与跨平台调用。",
                "接口采用分层分类管理：机械接口、电气接口、数据接口、人机接口分别编制 ICD，"
                "变更必须走技术状态控制流程。",
            ]
        )
    )
    story.append(h2("6.3　模块化与扩展"))
    story.extend(
        expand(
            [
                "作业模块、传感器套件、通信组件应支持模块级更换，更换后应自动或半自动完成标定与自检。"
                "预留不少于 2 路机械挂接接口扩展位和不少于 4 路电气扩展接口。",
                "软件插件/技能包机制应支持领域规则包、审查策略包与试验科目包的动态加载（示范工程接口）。",
            ]
        )
    )
    story.append(h2("6.4　技术状态与配置项"))
    story.append(
        p(
            "配置项划分应覆盖硬件配置项、软件配置项和成套资料配置项。功能基线在方案阶段冻结，"
            "分配基线在初步设计后冻结，产品基线在设计定型前冻结。基线变更按 GJB 3206A 执行。"
        )
    )
    story.append(h2("6.5　接口原则"))
    story.append(
        clause(
            "6.5.1",
            "对外接口应文档化、可测试、可版本化；禁止隐式约定。",
        )
    )
    story.append(
        clause(
            "6.5.2",
            "安全相关信号应冗余或采用故障安全设计，通信中断时应进入安全态。",
        )
    )
    story.append(
        clause(
            "6.5.3",
            "数据接口应支持时间戳、质量码与溯源标识，满足跨文档审查与试验报告自动生成需要。",
        )
    )
    story.append(PageBreak())
    # extra detail page
    story.append(h2("6.6　分系统功能分配（摘要）"))
    alloc = [
        ("动力", "额定功率、瞬态响应、能耗监测、故障降功率"),
        ("行走", "速度档位、转弯半径、爬坡、制动距离"),
        ("作业", "作业幅宽/深度/精度、负载自适应、快速挂接"),
        ("测控", "采样率、同步精度、标定、自检与 BIT"),
        ("通信", "覆盖距离、时延、丢包重传、抗干扰"),
        ("显控", "画面刷新、告警分级、权限、审计日志"),
    ]
    story.append(
        make_table(
            ["分系统", "功能分配要点"],
            alloc,
            col_widths=[3 * cm, 13 * cm],
        )
    )
    story.append(p("表 6　分系统功能分配摘要", "Caption"))
    story.append(
        p(
            "详细功能分配见《系统功能分配矩阵》和各分系统研制要求。总体单位负责保持矩阵与本文件指标一致，"
            "并在每次设计评审前提交差异说明。"
        )
    )
    story.append(PageBreak())
    return story


def chapter_7():
    story = [
        h1("7　主要战术技术指标"),
        h2("7.1　指标总表"),
        p(
            "本章给出本装备主要战术技术指标。分系统指标由总体分解，分解结果不得降低本章门槛。"
            "验证方法包括分析、仿真、试验、检验及组合方法，具体见第 15 章。"
        ),
    ]
    indicators = [
        ("整备质量", "≤ 8500 kg", "含标准作业模块"),
        ("外形尺寸（长×宽×高）", "≤ 6.5×2.5×3.2 m", "运输状态"),
        ("最大作业速度", "≥ 8 km/h", "额定负载"),
        ("持续作业时间", "≥ 8 h", "单次加油/充电"),
        ("定位精度（平面）", "≤ 5 cm", "差分条件下"),
        ("控制响应时延", "≤ 50 ms", "本地闭环"),
        ("数据完整率", "≥ 99.5%", "任务剖面统计"),
        ("MTBF", "≥ 300 h", "置信度 80%"),
        ("MTTR", "≤ 1.5 h", "现场可更换单元"),
        ("展开时间", "≤ 30 min", "标准地形"),
        ("噪声（操作位）", "≤ 85 dB(A)", "额定工况"),
        ("国产化率（关键件）", "满足当年要求", "名录动态更新"),
    ]
    story.append(
        make_table(
            ["指标项", "要求值", "备注"],
            indicators,
            col_widths=[5 * cm, 4 * cm, 7 * cm],
        )
    )
    story.append(p("表 7　主要战术技术指标", "Caption"))
    story.append(h2("7.2　指标分级"))
    story.extend(
        expand(
            [
                "指标分为门禁指标、考核指标和期望指标。门禁指标不达标不得转入下一研制阶段；"
                "考核指标为定型必考项；期望指标作为优选与改进方向，不作为否决项。",
                "表 7 中未标注的默认为考核指标。门禁指标清单在方案阶段由用户与总体共同确认，并纳入 TEMP。",
            ]
        )
    )
    story.append(h2("7.3　指标追溯"))
    story.append(
        p(
            "每项指标应建立“需求来源—分配—设计实现—验证证据”追溯链。文档平台生成与审校时，"
            "应能从条款跳转至引用标准、历史试验数据或规则条目。追溯标识建议采用“ZB-ZY-章条-序号”编码。"
        )
    )
    story.append(PageBreak())
    story.append(h2("7.4　作业性能指标细化"))
    detail = [
        ("作业幅宽", "可配置 2.0 / 2.5 / 3.0 m", "模块选配"),
        ("作业深度/高度控制精度", "±10 mm", "稳态"),
        ("直线行驶偏差", "≤ 5 cm / 100 m", "自动导航开启"),
        ("重复作业轨迹偏差", "≤ 8 cm", "同工况"),
        ("作业均匀性变异系数", "≤ 10%", "抽样方法见大纲"),
        ("快速挂接时间", "≤ 10 min", "两人作业"),
    ]
    story.append(
        make_table(
            ["项目", "要求", "说明"],
            detail,
            col_widths=[5 * cm, 5 * cm, 6 * cm],
        )
    )
    story.append(p("表 8　作业性能细化指标", "Caption"))
    story.append(h2("7.5　信息与数据指标"))
    story.extend(
        expand(
            [
                "本地存储容量应支持连续记录不少于 30 个工作日的原始数据；重要数据应双副本或等效保护。"
                "远程同步在可用链路下应支持断点续传，日终一致性校验失败率不高于 0.1%。",
                "关键事件日志保留时间不少于 3 年；日志应防篡改或具备完整性校验。",
            ]
        )
    )
    story.append(PageBreak())
    return story


def chapter_8():
    story = [
        h1("8　功能要求"),
        h2("8.1　基本功能"),
        clause("8.1.1", "应具备动力驱动、行走机动、作业执行、状态监测、告警与安全联锁等基本功能。"),
        clause("8.1.2", "应具备任务配置、参数下发、工况切换与一键安全停止功能。"),
        clause("8.1.3", "应具备数据采集、本地存储、质量标记、导出与远程回传功能。"),
        clause("8.1.4", "应具备故障诊断、BIT、日志查询与维护辅助功能。"),
        h2("8.2　作业功能"),
        p(
            "作业功能应覆盖标准科目与扩展科目。标准科目包括额定工况连续作业、变负载作业、"
            "启停冲击工况、坡道作业与夜间作业。扩展科目由试验大纲裁剪。"
        ),
    ]
    story.extend(
        [
            clause("8.2.1", "应支持作业参数预设模板不少于 20 套，并允许用户自定义保存。"),
            clause("8.2.2", "应支持作业过程关键参数实时曲线显示与超限告警。"),
            clause("8.2.3", "应支持作业结果自动摘要生成，字段映射至报告模板。"),
            h2("8.3　测控功能"),
            clause("8.3.1", "传感器通道应可配置，支持校准系数导入与有效期管理。"),
            clause("8.3.2", "采样策略应支持等间隔、事件触发与混合模式。"),
            clause("8.3.3", "应提供通道健康监测，异常通道可隔离并记录。"),
            h2("8.4　通信与协同功能"),
            clause("8.4.1", "应支持与试验指挥终端、数据中心及伴随机组的安全通信。"),
            clause("8.4.2", "编组协同时应共享位置、任务状态与安全包络信息。"),
            clause("8.4.3", "通信降级模式下应保证本地安全控制能力不丧失。"),
            h2("8.5　人机交互功能"),
            clause("8.5.1", "显控界面应分层分级，常用操作不超过 3 级菜单。"),
            clause("8.5.2", "告警分为提示、警告、严重三级，严重告警应声光同步并需确认。"),
            clause("8.5.3", "应支持多用户权限：操作、维护、试验主管、审计。"),
            PageBreak(),
            h2("8.6　数据与知识服务功能（示范）"),
            p(
                "为对接领域资源库与文档平台，本装备宜提供：试验数据打包上传、元数据自动抽取、"
                "与研制总要求条款的弱绑定标注、以及供智能体编排调用的只读 API。"
            ),
            clause("8.6.1", "上传数据包应包含原始数据、工况标签、设备版本与操作者标识。"),
            clause("8.6.2", "元数据字段应与领域本体对齐，同义术语消歧规则可配置。"),
            clause("8.6.3", "API 访问应鉴权、限流并留审计日志，禁止越权写入控制指令。"),
            h2("8.7　功能优先级"),
            p(
                "安全联锁与紧急停止为最高优先级；其次为基本机动与作业控制；再次为测控记录与通信；"
                "人机舒适性与扩展插件为最低优先级。资源争用时应按优先级抢占或降级。"
            ),
            PageBreak(),
        ]
    )
    return story


def chapter_9():
    story = [
        h1("9　性能要求"),
        h2("9.1　动力与能耗"),
        clause("9.1.1", "额定功率应满足最大作业负载与规定爬坡工况的同时需求，并留有不少于 10% 功率裕度。"),
        clause("9.1.2", "燃油消耗率或电能消耗应不高于同类成熟装备平均水平的 105%。"),
        clause("9.1.3", "冷启动性能应满足最低工作温度下 30 min 内达到可作业状态。"),
        h2("9.2　机动性能"),
        clause("9.2.1", "最小转弯半径、最大爬坡度、侧倾稳定性应满足表 9。"),
        clause("9.2.2", "制动距离在规定初速下应满足安全标准，紧急制动不得导致失控侧滑超出安全包络。"),
    ]
    mobility = [
        ("最小转弯半径", "≤ 6.5 m", "标准轮胎气压"),
        ("最大爬坡度", "≥ 20%", "干燥硬质坡道"),
        ("侧倾稳定角", "≥ 30°", "静态"),
        ("紧急制动距离", "≤ 12 m", "初速 20 km/h"),
    ]
    story.append(
        make_table(
            ["项目", "要求", "条件"],
            mobility,
            col_widths=[4 * cm, 4 * cm, 8 * cm],
        )
    )
    story.append(p("表 9　机动性能", "Caption"))
    story.append(h2("9.3　作业精度与品质"))
    story.extend(
        expand(
            [
                "作业精度指标以表 8 为准。品质评价应结合均匀性、重复性、损伤率（如适用）和能耗综合给出。"
                "抽样方案、测点布置与数据处理方法在试验大纲中规定，并与本文件保持一致。",
            ]
        )
    )
    story.append(h2("9.4　测控性能"))
    story.extend(
        [
            clause("9.4.1", "关键模拟量采样率不低于 100 Hz，同步误差不大于 1 ms。"),
            clause("9.4.2", "测量不确定度应满足指标判定需要，计量器具在检定有效期内。"),
            clause("9.4.3", "BIT 覆盖率：关键功能 ≥ 95%，重要功能 ≥ 85%。"),
        ]
    )
    story.append(h2("9.5　通信性能"))
    story.extend(
        [
            clause("9.5.1", "视距通信距离不低于 2 km（开阔地），端到端时延不大于 200 ms。"),
            clause("9.5.2", "在规定干扰环境下，关键指令送达成功率不低于 99%。"),
            clause("9.5.3", "定位定向更新率不低于 10 Hz。"),
        ]
    )
    story.append(PageBreak())
    story.append(h2("9.6　结构与材料性能"))
    story.extend(
        expand(
            [
                "主要承力结构安全系数应满足相关设计规范；疲劳寿命按任务剖面累计不少于一个大修周期。"
                "材料选型应考虑强度、耐蚀、可焊性、可采购性与环保要求。",
                "表面防护应适应第 11 章环境条件；紧固件防松措施应经验证。关键焊缝应进行规定比例探伤。",
            ]
        )
    )
    story.append(h2("9.7　液压与电气性能"))
    story.extend(
        [
            clause("9.7.1", "液压系统泄漏、温升、响应应满足作业精度与可靠性要求。"),
            clause("9.7.2", "电气系统绝缘电阻、耐压、接地与线束工艺应符合相关标准。"),
            clause("9.7.3", "电源品质应保证控制器与传感器在电压波动范围内正常工作。"),
        ]
    )
    story.append(h2("9.8　噪声、振动与舒适性"))
    story.extend(
        expand(
            [
                "操作位噪声、全身振动与座椅舒适性应满足职业健康相关要求。长时间作业模式下宜提供减振与降噪措施。"
                "对外辐射噪声应符合使用场地管理规定。",
            ]
        )
    )
    story.append(h2("9.9　性能裕度与降额"))
    story.append(
        p(
            "电子元器件、液压泵阀、轴承等关键件应按规范降额使用。设计应给出性能裕度说明，"
            "并在详细设计评审时接受审查。不得以牺牲安全裕度换取指标“擦边”达标。"
        )
    )
    story.append(PageBreak())
    return story


def chapter_10():
    story = [
        h1("10　可靠性、维修性、保障性、测试性与安全性"),
        h2("10.1　可靠性"),
        clause("10.1.1", "系统 MTBF 不低于 300 h（置信度 80%），任务可靠度按任务剖面计算不低于规定值。"),
        clause("10.1.2", "应开展可靠性建模、预计、FMEA/FTA 及增长试验，关闭高风险故障模式。"),
        clause("10.1.3", "软件可靠性应纳入软件测试与缺陷密度控制，关键软件缺陷归零后方可试验。"),
        h2("10.2　维修性"),
        clause("10.2.1", "MTTR 不大于 1.5 h；现场可更换单元应可单人/双人在规定时间内更换。"),
        clause("10.2.2", "维修可达性、防差错与测试点设置应满足维修性大纲。"),
        clause("10.2.3", "应提供维修手册、故障隔离手册与多媒体辅助（宜）。"),
        h2("10.3　保障性"),
        clause("10.3.1", "备件目录、工具清单、保障设备应与装备同步研制、同步鉴定。"),
        clause("10.3.2", "消耗品补给周期与品种应满足连续试验任务需要。"),
        clause("10.3.3", "包装、装卸、运输、贮存要求应成文并可检查。"),
        h2("10.4　测试性"),
        clause("10.4.1", "BIT 与外部测试设备配合，故障检测率、隔离率达到大纲规定。"),
        clause("10.4.2", "虚警率应受控，超过阈值必须分析原因并改进。"),
        clause("10.4.3", "测试数据应可导出并纳入质量数据包。"),
        PageBreak(),
        h2("10.5　安全性"),
        clause("10.5.1", "应识别危险源并保持危险跟踪闭环，不可接受风险必须消减至可接受水平。"),
        clause("10.5.2", "紧急停止、防护罩、警示标识、联锁装置必须有效且定期验证。"),
        clause("10.5.3", "高压、液压蓄能、旋转件等危险部位应有物理防护与操作规程。"),
        clause("10.5.4", "软件安全需求应单独标识，变更需安全影响分析。"),
        h2("10.6　五性工作项目"),
    ]
    work = [
        ("方案阶段", "五性要求论证、初步 FMEA、保障方案框架"),
        ("工程研制", "详细 FMEA/FTA、样机试验、增长与改进"),
        ("设计定型", "五性鉴定试验、问题归零、基线固化"),
        ("生产定型", "工艺稳定性、批产一致性、保障移交"),
    ]
    story.append(
        make_table(
            ["阶段", "主要工作"],
            work,
            col_widths=[3.5 * cm, 12.5 * cm],
        )
    )
    story.append(p("表 10　五性工作项目摘要", "Caption"))
    story.append(h2("10.7　问题归零"))
    story.append(
        p(
            "试验与使用中发现的问题按“定位、机理、复现、措施、举一反三”要求归零。"
            "重大问题归零报告应进入质量数据包，并回写资源库与文档审查规则（如适用）。"
        )
    )
    story.append(PageBreak())
    return story


def chapter_11():
    story = [
        h1("11　环境适应性与电磁兼容性"),
        h2("11.1　气候环境"),
    ]
    env = [
        ("工作温度", "-20 ℃ ～ +45 ℃"),
        ("贮存温度", "-40 ℃ ～ +60 ℃"),
        ("相对湿度", "≤ 95%（+30 ℃）"),
        ("海拔", "≤ 3000 m"),
        ("防护等级", "关键电控舱不低于 IP65"),
    ]
    story.append(make_table(["项目", "要求"], env, col_widths=[5 * cm, 11 * cm]))
    story.append(p("表 11　气候环境适应性", "Caption"))
    story.append(h2("11.2　力学环境"))
    story.extend(
        [
            clause("11.2.1", "振动、冲击、运输颠簸试验按 GJB 150A 及产品规范执行。"),
            clause("11.2.2", "田间不平路面连续作业后，紧固件松动与结构损伤不得超过允许限。"),
        ]
    )
    story.append(h2("11.3　其他环境"))
    story.extend(
        expand(
            [
                "应考虑沙尘、淋雨、霉菌（贮存）、盐雾（沿海转运）等环境。对密封件、过滤器、涂层提出相应要求。"
                "阳光辐射下的显控可读性与材料老化应评估。",
            ]
        )
    )
    story.append(h2("11.4　电磁兼容性"))
    story.extend(
        [
            clause("11.4.1", "电磁发射与敏感度满足 GJB 151B 适用条款及产品规范。"),
            clause("11.4.2", "车载电子设备互不干扰，关键控制在干扰下保持安全态。"),
            clause("11.4.3", "静电放电、浪涌与电源瞬态应有防护设计与验证。"),
        ]
    )
    story.append(PageBreak())
    story.append(h2("11.5　环境试验项目矩阵（摘要）"))
    matrix = [
        ("高温工作", "实验室", "性能监测"),
        ("低温工作", "实验室", "启动与性能"),
        ("湿热", "实验室", "绝缘与腐蚀征兆"),
        ("振动", "实验室", "结构与电连接"),
        ("冲击", "实验室", "强度与功能"),
        ("淋雨", "实验室/外场", "密封"),
        ("沙尘", "实验室", "滤清与密封"),
        ("EMC", "实验室", "发射/敏感度"),
        ("运输", "外场", "包装与绑扎"),
        ("综合气候", "外场", "任务剖面考核"),
    ]
    story.append(
        make_table(
            ["试验项目", "地点", "关注点"],
            matrix,
            col_widths=[4 * cm, 4 * cm, 8 * cm],
        )
    )
    story.append(p("表 12　环境试验项目摘要", "Caption"))
    story.append(
        p(
            "详细条件、判据与顺序在环境试验大纲中规定。允许剪裁，但剪裁理由应书面批准并评估风险。"
        )
    )
    story.append(PageBreak())
    return story


def chapter_12():
    story = [
        h1("12　信息化与软件要求"),
        h2("12.1　总体要求"),
        p(
            "软件研制执行 GJB 2786A、GJB 438B、GJB 5000B 等要求。关键软件应定义安全完整性目标，"
            "并完成需求、设计、代码、测试的双向追溯。"
        ),
        h2("12.2　软件配置项"),
    ]
    sw = [
        ("显控应用软件", "人机交互、任务管理、告警"),
        ("实时控制软件", "行走/作业闭环控制"),
        ("数据采集软件", "采样、存储、同步"),
        ("通信协议栈", "链路管理、安全传输"),
        ("维护诊断软件", "BIT、日志、标定"),
        ("数据网关软件", "回传、鉴权、API"),
    ]
    story.append(
        make_table(
            ["配置项", "主要功能"],
            sw,
            col_widths=[4.5 * cm, 11.5 * cm],
        )
    )
    story.append(p("表 13　软件配置项", "Caption"))
    story.append(h2("12.3　性能与实时性"))
    story.extend(
        [
            clause("12.3.1", "实时控制循环周期满足控制响应时延指标，抖动受控。"),
            clause("12.3.2", "显控关键画面刷新不低于 10 Hz，操作到反馈时延可感知评估。"),
            clause("12.3.3", "数据网关在链路可用时首包响应宜不大于 3 s（示范工程对齐训推/编排指标）。"),
        ]
    )
    story.append(h2("12.4　信息安全"))
    story.extend(
        expand(
            [
                "应实施身份鉴别、访问控制、通信加密（按密级）、日志审计与漏洞管理。"
                "禁止默认口令；维护接口应物理或逻辑关闭策略。供应链软件组件应清单化并扫描。",
            ]
        )
    )
    story.append(h2("12.5　数据格式与互操作"))
    story.append(
        p(
            "对外交换数据宜采用开放、文档化的格式；时间统一、单位统一、编码统一。"
            "与文档平台、资源库交换时，应携带溯源字段：装备编号、软件版本、条款引用、试验科目编码。"
        )
    )
    story.append(PageBreak())
    story.append(h2("12.6　软件工程过程"))
    story.extend(
        expand(
            [
                "需求基线、设计基线、产品基线应受控。代码评审、静态分析、单元测试、集成测试、系统测试、"
                "回归测试应有记录。覆盖率目标在软件开发计划中明确。",
                "缺陷按严重等级管理，致命/严重缺陷关闭前不得进入外场鉴定试验。"
                "变更影响分析应覆盖接口、安全、性能与文档一致性。",
            ]
        )
    )
    story.append(h2("12.7　智能化功能边界"))
    story.append(
        p(
            "辅助决策、自动调参、智能告警等功能应可关闭；关闭后装备仍能完成基本任务。"
            "智能化输出仅作建议时，界面应明确标识，避免操作员误解为强制指令。"
        )
    )
    story.append(PageBreak())
    return story


def chapter_13():
    story = [
        h1("13　人机工程与标准化"),
        h2("13.1　人机工程"),
        clause("13.1.1", "操纵件布局应符合可达性与防误操作要求，紧急操作件位置醒目且可盲操。"),
        clause("13.1.2", "显示信息优先级清晰，颜色与闪烁编码统一，并考虑色觉异常用户。"),
        clause("13.1.3", "座椅、踏板、视野与上下车踏步满足人机尺寸标准。"),
        clause("13.1.4", "维护作业姿态应尽量避免长时间极端姿势，提供支撑或辅助工具。"),
        h2("13.2　标准化、通用化、系列化"),
        clause("13.2.1", "优先采用国家标准、国家军用标准及领域示范标准，减少专用件。"),
        clause("13.2.2", "紧固件、液压接头、电气接插件应尽量通用，品种压缩并形成目录。"),
        clause("13.2.3", "系列化派生型号应保持核心接口与数据模型兼容。"),
        h2("13.3　编码与标识"),
        p(
            "产品铭牌、电缆号、管路号、软件版本号、技术资料号应唯一可追溯。"
            "二维码/条码宜用于实物与档案关联。标识应耐环境、可识读。"
        ),
        h2("13.4　文档标准化（对接文档平台）"),
        p(
            "研制过程形成的总要求、大纲、报告、纪要等应按模板与原子条款管理，"
            "支持提纲层级编辑、生成溯源、多策略审查与归档。术语与规则引用应指向受控库条目。"
        ),
        PageBreak(),
    ]
    return story


def chapter_14():
    story = [
        h1("14　质量保证与风险管理"),
        h2("14.1　质量体系"),
        p(
            "承研各方应具备并保持符合 GJB 9001 的质量管理体系。质量计划应覆盖本项目特殊要求、"
            "外包控制、关键特性控制与质量数据包要求。"
        ),
        h2("14.2　评审与检查"),
    ]
    reviews = [
        ("需求评审", "研制总要求、规格说明完整性与可验证性"),
        ("方案评审", "总体方案、风险、接口、五性"),
        ("PDR", "分配基线、初步设计"),
        ("CDR", "详细设计、工艺、试验性"),
        ("TRR", "试验条件、安全、数据记录"),
        ("定型评审", "指标达成、问题归零、资料齐套"),
    ]
    story.append(
        make_table(
            ["评审", "关注点"],
            reviews,
            col_widths=[3.5 * cm, 12.5 * cm],
        )
    )
    story.append(p("表 14　主要评审", "Caption"))
    story.append(h2("14.3　风险管理"))
    story.extend(
        expand(
            [
                "应建立风险清单，按概率与影响分级，制定缓解与应急措施，定期复评。"
                "技术风险、进度风险、供方风险、安全风险分类管理。高风险项进入管理层议事日程。",
            ]
        )
    )
    story.append(h2("14.4　不合格品与让步"))
    story.append(
        p(
            "不合格品隔离、评审、处置按体系文件执行。让步接收必须评估对指标、安全与互换性的影响，"
            "并获得规定层级批准。禁止对门禁指标让步。"
        )
    )
    story.append(h2("14.5　质量数据包"))
    story.append(
        p(
            "质量数据包至少包括：技术状态基线清单、试验记录、问题归零、计量证明、软件介质与校验、"
            "关键件合格证明、用户交接清单。电子数据包结构应便于归档与跨文档审查。"
        )
    )
    story.append(PageBreak())
    return story


def chapter_15():
    story = [
        h1("15　试验与鉴定要求"),
        h2("15.1　一般要求"),
        p(
            "试验与鉴定应覆盖性能、五性、环境、电磁兼容、软件与安全性等。坚持“先分析仿真、后实物；"
            "先分系统、后系统；先实验室、后外场”的原则，编制 TEMP 并动态维护。"
        ),
        h2("15.2　试验类别"),
    ]
    cats = [
        ("研制试验", "设计验证、风险消减、性能摸底"),
        ("鉴定试验", "设计定型/生产定型考核"),
        ("验收试验", "交付与批次验收"),
        ("例行试验", "批产一致性与质量监控"),
    ]
    story.append(
        make_table(
            ["类别", "目的"],
            cats,
            col_widths=[3.5 * cm, 12.5 * cm],
        )
    )
    story.append(p("表 15　试验类别", "Caption"))
    story.append(h2("15.3　科目与样本量"))
    story.extend(
        expand(
            [
                "科目设置应能验证第 7～12 章要求。样本量、试验时间与统计分析方法在大纲中规定，"
                "可靠性试验时间应足以支撑 MTBF 评定假设。",
                "外场试验应记录气象、地表、操作者与异常事件，保证可复现与可审计。",
            ]
        )
    )
    story.append(h2("15.4　数据采集与报告"))
    story.extend(
        [
            clause("15.4.1", "原始数据真实完整，禁止无痕篡改；处理过程可复核。"),
            clause("15.4.2", "报告应包含目的、条件、方法、数据、不确定度、结论与遗留问题。"),
            clause("15.4.3", "报告模板与审查规则应与文档平台策略库对齐，支持自动初检。"),
        ]
    )
    story.append(PageBreak())
    story.append(h2("15.5　鉴定结论与遗留问题"))
    story.append(
        p(
            "鉴定结论分为通过、有条件通过和不通过。有条件通过必须附整改计划、责任单位与完成时限。"
            "遗留问题纳入跟踪清单，关闭证据进入质量数据包。"
        )
    )
    story.append(h2("15.6　试验安全"))
    story.append(
        p(
            "试验前完成安全检查表与应急预案演练。高风险科目实行双人确认与现场指挥责任制。"
            "发生险情立即停止，保护现场并按程序报告。"
        )
    )
    story.append(PageBreak())
    return story


def chapter_16():
    story = [
        h1("16　研制阶段与进度节点"),
        h2("16.1　阶段划分"),
    ]
    stages = [
        ("论证与方案", "总要求固化、方案评审、风险清单"),
        ("工程研制", "详细设计、样机、研制试验、PDR/CDR"),
        ("设计定型", "鉴定试验、定型评审、基线冻结"),
        ("生产定型", "工艺定型、批产验证、保障移交"),
    ]
    story.append(
        make_table(
            ["阶段", "主要标志性成果"],
            stages,
            col_widths=[3.5 * cm, 12.5 * cm],
        )
    )
    story.append(p("表 16　研制阶段", "Caption"))
    story.append(h2("16.2　里程碑（示例）"))
    miles = [
        ("M1", "研制总要求批准", "T0"),
        ("M2", "方案评审通过", "T0+4 月"),
        ("M3", "PDR 通过", "T0+10 月"),
        ("M4", "初样完成", "T0+16 月"),
        ("M5", "CDR 通过", "T0+20 月"),
        ("M6", "正样完成", "T0+26 月"),
        ("M7", "设计定型", "T0+32 月"),
        ("M8", "生产定型", "T0+40 月"),
    ]
    story.append(
        make_table(
            ["里程碑", "内容", "计划节点"],
            miles,
            col_widths=[2.5 * cm, 7 * cm, 6.5 * cm],
        )
    )
    story.append(p("表 17　里程碑计划（示例）", "Caption"))
    story.append(
        p(
            "实际进度以批复计划为准。关键路径变化超过规定阈值应启动进度风险评审并更新 TEMP。"
        )
    )
    story.append(h2("16.3　交付物"))
    story.append(
        p(
            "各阶段交付物包括但不限于：技术文件、软件介质、样机/产品、试验报告、质量数据包与培训材料。"
            "齐套性检查表由总体单位维护，用户与鉴定机构参加确认。"
        )
    )
    story.append(PageBreak())
    return story


def chapter_17():
    story = [
        h1("17　附录"),
        h2("附录 A（规范性）　指标验证方法对照"),
    ]
    verify = [
        ("整备质量", "称重", "鉴定"),
        ("作业速度", "外场测量", "鉴定"),
        ("定位精度", "对比测量", "鉴定"),
        ("控制时延", "实验室/半实物", "研制+鉴定"),
        ("MTBF", "可靠性试验+统计", "鉴定"),
        ("MTTR", "维修性试验", "鉴定"),
        ("EMC", "实验室", "鉴定"),
        ("软件功能", "测试+测评", "鉴定"),
    ]
    story.append(
        make_table(
            ["指标", "主要方法", "阶段"],
            verify,
            col_widths=[4 * cm, 6 * cm, 6 * cm],
        )
    )
    story.append(p("表 A.1　指标验证方法对照（节选）", "Caption"))
    story.append(h2("附录 B（资料性）　文档与规则映射（演示）"))
    story.extend(
        expand(
            [
                "本附录说明本文件与文档平台审查规则库的映射关系，便于演示“提纲→生成→溯源→审查→归档”。",
                "术语类规则：对第 3 章术语与缩略语进行一致性检查，术语总量指标对齐平台术语库建设要求。",
                "逻辑类规则：检查第 7 章指标与第 9、10、15 章验证条款是否存在缺失、冲突或不可测。",
                "跨文档规则：将本文件与《试验大纲》《鉴定大纲》《评审报告》进行实体与指标比对，"
                "输出风险等级与一致性链路。",
            ]
        )
    )
    story.append(h2("附录 C（资料性）　修订记录"))
    revs = [
        ("V0.1", "2024-06-01", "征求意见稿"),
        ("V0.9", "2024-08-15", "评审稿"),
        ("V1.0", "2024-10-01", "试行稿发布"),
    ]
    story.append(
        make_table(
            ["版本", "日期", "说明"],
            revs,
            col_widths=[3 * cm, 4 * cm, 9 * cm],
        )
    )
    story.append(p("表 C.1　修订记录", "Caption"))
    story.append(PageBreak())
    # filler pages to reach ~48 if needed - structured Q&A style requirements
    story.append(h2("附录 D（资料性）　条款释义与常见问题"))
    faqs = [
        (
            "问：门禁指标如何确定？",
            "答：由用户、总体与鉴定机构在方案阶段共同确认，纳入 TEMP，并在本文件修订时同步更新。",
        ),
        (
            "问：指标冲突如何处理？",
            "答：以较严且可验证者为准；无法同时满足时，履行指标调整审批，禁止擅自取舍。",
        ),
        (
            "问：软件版本与硬件如何对齐？",
            "答：通过技术状态基线与装机软件清单对齐，试验前核对校验和与配置项版本。",
        ),
        (
            "问：外场异常中断如何计数据？",
            "答：按大纲规定区分有效试验时间与无效时间，原因记入事件日志并评估对统计的影响。",
        ),
        (
            "问：国产化率变化怎么办？",
            "答：按主管部门最新名录执行；替代方案应完成验证并更新合格供方与技术状态。",
        ),
        (
            "问：文档平台生成的初稿能否直接作废纸质签字页？",
            "答：不能。生成初稿仅提高编制效率，正式文本仍需按规定签署、审批与受控分发。",
        ),
    ]
    for q, a in faqs:
        story.append(p(q, "BodyNoIndent"))
        story.append(p(a))
        story.append(Spacer(1, 0.15 * cm))
    story.append(PageBreak())

    story.append(h2("附录 E（资料性）　参考工作分解结构（节选）"))
    wbs = [
        ("1", "项目管理"),
        ("1.1", "计划与进度"),
        ("1.2", "技术状态管理"),
        ("1.3", "质量与风险"),
        ("2", "系统工程"),
        ("2.1", "需求分析"),
        ("2.2", "架构设计"),
        ("2.3", "接口控制"),
        ("3", "动力与行走"),
        ("4", "作业系统"),
        ("5", "测控通信"),
        ("6", "软件"),
        ("7", "试验与鉴定"),
        ("8", "综合保障"),
        ("9", "资料与培训"),
    ]
    story.append(
        make_table(
            ["WBS", "名称"],
            wbs,
            col_widths=[3 * cm, 13 * cm],
        )
    )
    story.append(p("表 E.1　WBS 节选", "Caption"))
    story.append(
        p(
            "完整 WBS 见项目管理计划。WBS 单元应与经费科目、进度计划、风险条目建立映射，"
            "便于里程碑考核与审计。"
        )
    )
    story.append(PageBreak())

    story.append(h2("附录 F（资料性）　示范工程对齐说明"))
    story.extend(
        expand(
            [
                "本文件作为《领域文档自动编写与审校平台》演示样例，页数与结构用于支撑：单文档多章节解析、"
                "提纲提取、条款级溯源、多策略审查与跨文档比对。",
                "文中涉及的资源库、训推、智能体编排及再造/探针/设计/文档/研判等平台能力，"
                "仅表达业务对齐关系，不构成本装备硬件交付范围，除非在合同附件中另行约定。",
                "性能类表述如调度时延、术语规模、审查模版数量等，对应采购指标的平台侧要求，"
                "装备侧以第 7～12 章可验证指标为准。",
                "样例密级标注为“内部”，仅用于研发演示；真实项目按保密规定定密与管控。",
            ]
        )
    )
    story.append(PageBreak())
    story.append(h2("附录 G（资料性）　主要引用条款索引（节选）"))
    story.append(
        p(
            "本索引便于审查人员与智能审校按主题跳转。正式受控版本由标准化部门维护，"
            "页码以发布稿页眉页脚为准。",
            "BodyNoIndent",
        )
    )
    idx = [
        ("范围与效力", "第 1 章"),
        ("引用标准", "第 2 章"),
        ("术语与缩略语", "第 3 章"),
        ("研制目标与原则", "第 4 章"),
        ("任务剖面", "第 5 章、表 3"),
        ("系统组成", "第 6 章、表 5"),
        ("战术技术指标", "第 7 章、表 7～表 8"),
        ("功能要求", "第 8 章"),
        ("性能要求", "第 9 章、表 9"),
        ("五性要求", "第 10 章、表 10"),
        ("环境与 EMC", "第 11 章、表 11～表 12"),
        ("软件与信息化", "第 12 章、表 13"),
        ("人机与标准化", "第 13 章"),
        ("质量与风险", "第 14 章、表 14"),
        ("试验鉴定", "第 15 章、表 15"),
        ("阶段与里程碑", "第 16 章、表 16～表 17"),
        ("验证方法对照", "附录 A"),
        ("文档规则映射", "附录 B"),
        ("跨文档检查", "补充要求 S10"),
    ]
    story.append(
        make_table(
            ["主题", "位置"],
            idx,
            col_widths=[6 * cm, 10 * cm],
        )
    )
    story.append(p("表 G.1　条款索引", "Caption"))
    story.append(PageBreak())
    story.append(h2("附录 H（资料性）　示范审查用例说明"))
    story.extend(
        expand(
            [
                "用例 H1（术语一致性）：故意将“平均故障间隔时间”与“MTBF”混用且未在缩略语表定义，"
                "审查应提示补充定义或统一用语。",
                "用例 H2（指标冲突）：若试验大纲将 MTBF 写为 250 h，而本文件为 300 h，跨文档审查应标为高风险冲突。",
                "用例 H3（不可测条款）：删除第 15 章对应验证方法后，逻辑审查应提示“有指标无验证”。",
                "用例 H4（溯源跳转）：从生成初稿的某条款跳回本文件表 7 对应行及引用标准条目。",
                "用例 H5（归档类型）：将本稿归入“研制总要求”文书类型，关联模板编号与版本。",
            ]
        )
    )
    story.append(
        p(
            "上述用例仅用于平台演示脚本编排，不代表对本文件内容的真实质疑。"
            "演示结束后应恢复受控文本，避免演示篡改流入正式库。"
        )
    )
    story.append(PageBreak())
    story.append(h2("附录 I（资料性）　文件发放与持有记录（样式）"))
    story.append(
        p(
            "下表为受控分发记录样式，正式项目由文档管理员按密级与知悉范围填写。"
            "电子分发应记录接收账号、下载时间与版本校验值。",
            "BodyNoIndent",
        )
    )
    dist = [
        ("01", "项目办公室", "1", "批准稿"),
        ("02", "总体单位", "2", "受控复印"),
        ("03", "动力分系统承制单位", "1", "受控复印"),
        ("04", "作业分系统承制单位", "1", "受控复印"),
        ("05", "测控通信承制单位", "1", "受控复印"),
        ("06", "软件承制单位", "1", "受控复印"),
        ("07", "试验鉴定机构", "2", "受控复印"),
        ("08", "用户代表", "1", "受控复印"),
        ("09", "质量部门", "1", "受控复印"),
        ("10", "档案室", "1", "归档原件"),
    ]
    story.append(
        make_table(
            ["序号", "持有单位", "份数", "形式"],
            dist,
            col_widths=[2 * cm, 6 * cm, 2.5 * cm, 5.5 * cm],
        )
    )
    story.append(p("表 I.1　发放记录样式", "Caption"))
    story.append(
        p(
            "持有单位变更、份数增减或版本替换时，应收回作废页或标注作废，防止多版本并行误用。"
            "作废文件销毁应双人监督并登记。电子副本在系统中置为“作废只读”，保留审计轨迹。"
        )
    )
    story.append(Spacer(1, 1.5 * cm))
    story.append(p("（全文完）", "CoverMeta"))
    story.append(Spacer(1, 0.5 * cm))
    story.append(
        p(
            "编制：总体论证组　　审核：质量与标准化组　　批准：项目办公室",
            "CoverMeta",
        )
    )
    story.append(Spacer(1, 0.3 * cm))
    story.append(p("文件编号：YS-ZB-ZY-2024-001　　版次：V1.0", "CoverMeta"))
    return story


def build_extra_pages_to_target(story, target_pages=48):
    """If under target, append structured filler chapters before final render adjustment.

    Actual page count is measured after build; we instead add content blocks
    proportional to shortfall in a second pass. This helper adds fixed extra
    technical narrative pages commonly found in such requirements docs.
    """
    extra = []
    # Additional detailed requirements often present in real docs
    blocks = [
        (
            "补充要求 S1　供方与外包控制",
            [
                "关键件供方应列入合格供方名录，现场审核频次按质量计划执行。",
                "外包设计与试验应签订技术质量协议，明确接口、验收准则与知识产权归属。",
                "供方变更属于技术状态变更，须评估对指标与认证的影响。",
                "进口件应有替代路线图与库存策略，满足可采购性与可维修性。",
                "原材料入厂复验项目覆盖关键特性，保留复验记录至规定年限。",
            ],
        ),
        (
            "补充要求 S2　工艺与制造",
            [
                "关键工序应编制作业指导书，实行首件鉴定与三检制。",
                "特种工艺人员持证上岗，工艺参数受控并留痕。",
                "数字化制造数据与设计数据保持一致性校验。",
                "装配过程防差错工装与扭矩管理应落实。",
                "整机下线检验覆盖功能、安全与外观，形成交验记录。",
            ],
        ),
        (
            "补充要求 S3　计量与校准",
            [
                "测量设备按周期检定/校准，状态标识清晰。",
                "试验用传感器现场校准方法与周期在大纲明确。",
                "量值溯源链完整，对判定结论有影响的测量应评估不确定度。",
                "软件化测量系统的算法版本纳入配置管理。",
                "发现超量程或超期使用，对已测数据有效性进行追溯评估。",
            ],
        ),
        (
            "补充要求 S4　培训与移交",
            [
                "交付前完成操作、维护、试验科目培训并考核建档。",
                "移交清单包括实物、软件、资料、备件与未闭环问题。",
                "质保期内技术支持响应时限按合同执行。",
                "重大升级应提供差异说明与再培训。",
                "用户反馈纳入缺陷与需求管理库，驱动改进。",
            ],
        ),
        (
            "补充要求 S5　数据治理与归档",
            [
                "研制与试验数据分级分类，明确保留期限与访问权限。",
                "归档数据包校验和与目录机读，支持检索与抽检。",
                "个人/团队知识沉淀按资源库规范入库，标注来源与密级。",
                "销毁与降密按保密与档案规定执行。",
                "跨平台数据字典变更应通知相关系统并回归验证。",
            ],
        ),
        (
            "补充要求 S6　伦理、环保与职业健康",
            [
                "研制与试验遵守环保排放与危废处置规定。",
                "噪声、振动、粉尘、油液泄漏等职业健康风险应评估与防控。",
                "野外试验减少对农田与生态的不必要扰动，结束恢复现场。",
                "智能化数据采集不得违规采集与任务无关的个人信息。",
                "对外宣传材料不得泄露内部指标与未公开技术方案。",
            ],
        ),
        (
            "补充要求 S7　接口一致性与联调",
            [
                "机械、电气、数据、人机四类接口应分别建立 ICD，版本与变更单一一对应。",
                "分系统入所（厂）联调前完成接口符合性自检，出具自检报告。",
                "系统联调科目覆盖额定、边界与故障注入三类工况。",
                "接口冻结后的临时跳线、临时软件补丁必须受控并限期关闭。",
                "联调问题按严重等级进入缺陷库，关闭证据可追溯至回归用例。",
            ],
        ),
        (
            "补充要求 S8　仿真与数字样机",
            [
                "关键性能宜建立数字样机或半实物仿真模型，并给出与实物的相关性说明。",
                "仿真输入、假设与版本纳入技术状态管理，禁止无版本“口头模型”。",
                "以仿真替代部分实物试验时，应经用户与鉴定机构同意并写入 TEMP。",
                "仿真结果用于设计决策的，应保留可复核的原始工程文件。",
                "数字样机与资源库/文档平台对接时，仅开放只读或受控写入通道。",
            ],
        ),
        (
            "补充要求 S9　网络安全与供应链",
            [
                "网络边界、远程运维通道应按最小权限开通，默认关闭高危端口。",
                "固件与应用程序升级包应签名校验，防止供应链投毒。",
                "第三方组件建立 SBOM，高危漏洞按时限处置。",
                "试验外场临时组网应划定安全域，与办公网隔离。",
                "发生安全事件按应急预案处置，并评估对鉴定数据完整性的影响。",
            ],
        ),
        (
            "补充要求 S10　跨文档一致性检查清单",
            [
                "《研制总要求》与《试验大纲》指标名称、量纲、判据应一致。",
                "《鉴定大纲》科目应覆盖门禁指标与考核指标，允许裁剪须有批准。",
                "《评审报告》结论应能回溯至原始试验记录与问题归零单。",
                "软件《需求规格说明》与装机软件清单版本应匹配。",
                "综合保障文件中的备件与工具应与实物移交清单一致。",
            ],
        ),
    ]
    for title, paras in blocks:
        extra.append(PageBreak())
        extra.append(h1(title))
        for i, t in enumerate(paras, 1):
            extra.append(clause(f"{i}", t))
        extra.append(
            p(
                "本补充要求与正文条款同等纳入质量计划检查范围。检查方式包括文件审查、现场核实与抽样测试。"
                "不符合项应开具整改通知并验证关闭。重复发生的问题应提升至管理评审。"
            )
        )
        extra.append(
            p(
                "相关记录表单由质量部门统一编号。电子记录应具备时间戳与操作者标识，纸质记录字迹清晰、"
                "更改规范。记录保存期限不少于装备寿命周期或合同约定年限中的较长者。"
            )
        )
        extra.append(
            p(
                "执行中如与正文条款表述冲突，以正文强制性条款为准，并将冲突条目提交总体单位协调修订。"
                "示范工程文档审校可将本补充要求条目映射为可执行规则，用于跨文档联合审查演示。"
            )
        )
    return story + extra


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)

    story = []
    story += cover_page()
    story += toc_page()
    story += chapter_1()
    story += chapter_2()
    story += chapter_3()
    story += chapter_4()
    story += chapter_5()
    story += chapter_6()
    story += chapter_7()
    story += chapter_8()
    story += chapter_9()
    story += chapter_10()
    story += chapter_11()
    story += chapter_12()
    story += chapter_13()
    story += chapter_14()
    story += chapter_15()
    story += chapter_16()
    story += chapter_17()
    story = build_extra_pages_to_target(story)

    doc = BaseDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=2.2 * cm,
        rightMargin=2.2 * cm,
        topMargin=2.0 * cm,
        bottomMargin=2.0 * cm,
        title="某型装备研制总要求",
        author="某装备试验鉴定中心",
    )
    frame = Frame(
        doc.leftMargin,
        doc.bottomMargin,
        doc.width,
        doc.height,
        id="normal",
    )
    doc.addPageTemplates(
        [PageTemplate(id="main", frames=frame, onPage=header_footer)]
    )
    doc.build(story)

    # report page count via pypdf if available, else parse with reportlab canvas count
    try:
        from pypdf import PdfReader

        n = len(PdfReader(str(OUT)).pages)
    except Exception:
        try:
            import subprocess

            subprocess.run(["pip", "install", "pypdf", "-q"], check=False)
            from pypdf import PdfReader

            n = len(PdfReader(str(OUT)).pages)
        except Exception:
            n = -1

    print(f"Wrote: {OUT}")
    print(f"Pages: {n}")
    return n


if __name__ == "__main__":
    main()
