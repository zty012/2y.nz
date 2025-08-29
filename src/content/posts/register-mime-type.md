---
title: 向 IANA 申请新的 Media Type (MIME Type) 全流程
published: 2025-08-29
description: 向 IANA 申请一个 Media Type，这样就可以让别的软件识别你的文件格式
image: ""
tags:
  - IANA
  - 硬核
category: 教程
draft: false
lang: ""
---

本文以 `application/vnd.project-graph` 为例，这是一个基于 ZIP 和 MessagePack 的文件格式

建议使用 `application/vnd.` 前缀，其他（比如 `prs.`）可能会被拒绝，`x-` 前缀已经被废弃

## 前期准备

- 一个邮箱：用于与 IANA 进行沟通
- 标准文档：必须用英文撰写，描述你的文件格式的细节 ([example](https://project-graph.top/docs/spec/prg))
- 风险评估：说明你的文件格式的安全性和潜在风险

## 填写表单

> [!NOTE]
> 如果提交失败，你输入的东西不会丢失

打开 [IANA Media Types Registration Form](https://www.iana.org/form/media-types)，填写以下信息：

### Name

最好填写真实的姓名，提高社区对你的信任度

### Email

填写你的邮箱地址，最好写一个长期可用的邮箱

### Type Name

即斜杠前面的部分，比如 `application`、`text`、`image` 等

### Subtype Name

下拉框中选择 `vnd.`，输入框中填写你的子类型名称，比如 `project-graph`

### Required Parameters 和 Optional Parameters

比如有一个类型 `text/html; charset=UTF-8`，其中 `charset` 就是一个 Required Parameter

如果不需要填写 `N/A` 即可

### Encoding Considerations

文件使用的编码方式

| 选项   | 是否二进制 | 字符范围 |
| ------ | ---------- | -------- |
| 7bit   | 否         | ASCII    |
| 8bit   | 否         | UTF-8    |
| binary | 是         |          |

`frame` 选项不用管，因为我也不知道是干嘛的

### Security Considerations

描述你的文件格式的安全性和潜在风险，至少需要涵盖以下几点：

1. 说明媒体类型是否包含活动或可执行内容。如果媒体类型确实包含可执行内容，请说明已采取哪些措施来确保它可以安全执行，例如沙箱、安全作集、签名内容等。
2. 说明媒体类型中包含的信息是否需要隐私或完整性服务。
3. 如果对 （2） 的答案是肯定的，请详细说明媒体类型本身提供的任何隐私或完整性服务。如果它不提供此类服务，请解释应如何在外部提供这些服务，例如通过使用 SSL/TLS。
4. 如果媒体类型使用现有格式（e.g. XML 或 JSON），则必须引用该格式的安全注意事项，并且必须描述与该格式的使用相关的任何问题，例如 XML 可扩展性。
   a. 如果介质类型采用压缩，则必须涵盖与该用法相关的安全考虑。
   b. 如果媒体类型采用容器格式，例如 ZIP，则需要描述与该使用相关的任何问题。
5. 如果媒体类型包含必须引用的链接才能正确解释该类型，则应注意这一点。

```plain title="Example"
Compression Bombs: A PRG file may contain a small ZIP that decompresses to an extremely large amount of data, causing denial-of-service. Implementations MUST impose reasonable limits on the number of extracted files and the total uncompressed size.
Path Traversal: Maliciously crafted ZIP entries could have names like ../../../some_important_file. Implementations MUST NOT extract files to filesystem, instead, read them directly from the ZIP stream to memory or a controlled environment.
Attachment Risks: The attachments directory can contain any file type. The application processing the PRG file is responsible for handling each attachment in a secure manner (e.g., run script files in sandbox, detect malware in attachments).
```

### Interoperability Considerations

描述你的文件格式的互操作性（即别的软件操作你的文件）考虑

```plain title="Example"
This media type defines a format for representing complex node graphs, such as project dependency graphs.
The content is a ZIP-archived container that holds one `stage.msgpack` file serialized using MessagePack, and may have other file in any format. This combination provides efficient storage and fast parsing.
The structure of the MessagePack-serialized data within the archive MUST conform to the schema defined in [https://project-graph.top/docs/spec/prg]
Key considerations for implementers include:
- Handling of required and optional properties gracefully (e.g., ignoring unknown optional properties rather than failing).
- Being aware that the graph may contain cycles and must be processed accordingly to avoid infinite loops.
- The possibility of very large graphs, requiring streaming or chunked processing strategies.
```

### Published specification

填写可公开访问的标准文档链接

### Application Usage

哪个软件用了这个格式，一般填写你自己的软件即可

### Fragment Identifier Considerations

描述 Anchor (`#`) 符号后面的内容

```plain title="Example"
Fragment identifier considerations: UUIDs separated by `;`
See section 6.5 in the specification
```

### Provisional Registrations

选 `No`

### Additional Information

- Deprecated alias names for this type: `N/A`
- Magic number(s): 填写文件的魔数，比如 ZIP 的 `PK\x03\x04`
- File extension(s): 文件的扩展名，比如 `.prg`
- Macintosh file type code(s): `N/A`
- Object Identifier(s) or OID(s): `N/A`

### Intended Usage

选 `COMMON`

### Other Information & Comments

不用管

### Contact Person 和 Author/Change Controller

这个 Media Type 的联系人，邮箱一定要长期可用！

### 提交表单

检查无误后，点 `Lodge request` 提交表单

## 收到邮件

不出意外，凌晨 1 点左右你会收到来自 `iana-mime@iana.org` 的邮件，内容大致如下：

```plain
Dear <x>,

Thank you for contacting us.

When we send media type requests to the IESG-designated expert for review, we typically copy a publicly-viewable mailing list. Is that OK for this request, or does this need to be handled privately?

If we do copy the list, we'll wait to send you any feedback until the expert determines what (if anything) should be passed along.

Best regards,

<y>
```

直接回复 OK

```plain
Hi <y>,

That’s fine--please proceed with copying the public list.

Thanks for checking.

Best regards,
<x>
```

## 专家审核

接下来会收到另一封来自 `iana-mime@iana.org` 的邮件，内容大致如下：

```plain
Hi <x>,

I've sent this on to the expert (a volunteer designated by the IESG) and the mailing list. Thanks!

Best regards,
<y>
```

然后打开 [Mailing List](https://mailarchive.ietf.org/arch/)，搜索 `media-types`，不出意外会看到一封关于你的 Media Type 的邮件，内容大致如下：

```plain
Hi <z>,

Would you be able to review this new request by <date>?

thanks,
<y>
```

专家会在 `<date>` 这一天之前处理你的请求

## to be continued
