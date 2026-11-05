# Component vocabulary

Use `kit.<name>(...)` from `scripts/lib/components.mjs`. Components inherit the selected style's colors, line weight, radius, typography, and background. Arguments use pixel coordinates on the scene canvas. All text is XML-escaped by the kit.

## Actors and channels

- `person(x,y,size)`, `avatar(x,y,label,size)`, `avatarStack(x,y,labels,size)`
- `mail(x,y,size)`, `chatBubble(x,y,w,h,label)`, `phone(x,y,w,h,label)`
- `browser(x,y,w,h,title)`, `document(x,y,w,h,label)`, `codeWindow(x,y,w,h,label)`
- `emailCard(x,y,w,h,{sender,subject,preview,time})` (use at least 180 px height)
- `chatMessage(x,y,w,h,{sender,message,time,direction})` (`direction`: `incoming` or `outgoing`)

## Work and state

- `issueTicket(x,y,w,h,title)`, `calendar(x,y,w,h,date)`, `database(x,y,w,h,label)`
- `eventCard(x,y,w,h,{month,day,title,time,status})` (use at least 120 px height)
- `taskCard(x,y,w,h,title)`, `progress(x,y,w,value)`, `statusBadge(x,y,label,state)`
- `timeline(x,y,w,items)`, `flowArrow(x1,y1,x2,y2)`, `queue(x,y,w,labels)`

## Evidence and context

- `quote(x,y,w,h,text)`, `metric(x,y,value,label)`, `barChart(x,y,w,h,items)`
- `lineChart(x,y,w,h,points)`, `comparison(x,y,w,h,left,right)`, `mapPin(x,y,size)`
- `book(x,y,w,h,label)`, `clock(x,y,size)`, `imageFrame(x,y,w,h,href,label)`

An icon is a small symbol, not the whole scene. `kit.icon(name,x,y,size)` uses the packaged Lucide subset. Do not stretch product marks or present a generic symbol as a real brand logo. If a needed object is absent, build it from `kit.rect`, `kit.line`, `kit.circle`, `kit.text`, and `kit.path`, keeping the style tokens.

For manual multiline copy, use `kit.textLines(x,y,['line 1','line 2'],size,lineHeight,color,weight)`. It does not measure or wrap automatically; inspect actual glyphs and bounds at delivery size. The three richer widgets are illustrative UI structures, not replicas of any product. Omit fields that are absent from the source rather than inventing sender, time, or completion state; if the whole scene is synthetic, mark it clearly in `meta.sourceRefs`.

Motion helpers: `kit.ease(x)`, `kit.reveal(t,start,duration)`, `kit.group(opacity,svg)`, and `kit.move(x,y,svg)`. Animate the state of a semantic component (message sent, progress advanced, choice rejected), not a floating dot that leaves the underlying idea static.

## Field and state discipline

Before drawing a widget, list its visible fields and mark each as **quoted or reported**, **clearly synthetic**, or **not supported**. Omit the last group. A detail may clarify the example, but the frame must plainly say it is synthetic. Keep the same named field visually continuous when it moves from one object to another.

| Widget | Primary fields | Optional fields to remove first in portrait | State rule |
| --- | --- | --- | --- |
| Email | Sender or source, subject, the relevant excerpt or time | Mailbox chrome, unrelated preview, received timestamp | A sent/read state needs source support; extraction highlights the exact text being transferred. |
| Calendar event | Date, time, title | Decorative month navigation, status badge | Show completion only when the source says it happened or the whole workflow is labeled synthetic. |
| Task or issue | Actual task, responsible actor if given, state | ID, progress bar, auxiliary tags | Do not synthesize progress percentage or successful resolution. |
| Document or quote | Exact passage, source status, specific highlighted fragment | Border decoration, catalog number, redundant provenance | An archive label requires a real archive source; otherwise call it a source excerpt. |
| Data mark | Value, unit, comparison baseline | Gridlines, distant legend, ornamental badges | A comparison bar uses a valid scale and reveals labels with final marks. |

`assets/examples/showcase/14-evidence-*`, `15-data-*`, and `16-state-*` demonstrate these choices at landscape and portrait sizes. These are not new component APIs; use the existing `kit` primitives when fixed-size convenience widgets are too dense or too sparse.
