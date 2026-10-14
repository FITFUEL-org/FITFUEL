using System.IO.Compression;
using System.Xml.Linq;

if (args.Length != 2)
{
    Console.Error.WriteLine("Usage: SlideFix <input.pptx> <output.pptx>");
    return 2;
}

XNamespace drawing = "http://schemas.openxmlformats.org/drawingml/2006/main";
var source = Path.GetFullPath(args[0]);
var destination = Path.GetFullPath(args[1]);
var fixedSlides = 0;

using (var input = ZipFile.OpenRead(source))
using (var output = ZipFile.Open(destination, ZipArchiveMode.Create))
{
    foreach (var entry in input.Entries)
    {
        var copy = output.CreateEntry(entry.FullName, CompressionLevel.Optimal);
        using var sourceStream = entry.Open();
        using var targetStream = copy.Open();

        if (!entry.FullName.StartsWith("ppt/slides/slide", StringComparison.Ordinal) ||
            !entry.FullName.EndsWith(".xml", StringComparison.Ordinal) ||
            entry.FullName.Contains("/_rels/", StringComparison.Ordinal))
        {
            sourceStream.CopyTo(targetStream);
            continue;
        }

        var document = XDocument.Load(sourceStream);
        var changed = false;
        foreach (var text in document.Descendants(drawing + "t").ToList())
        {
            if (!text.Value.Contains(@"`n", StringComparison.Ordinal))
            {
                continue;
            }

            var run = text.Parent;
            var paragraph = run?.Parent;
            if (run?.Name != drawing + "r" || paragraph is null)
            {
                continue;
            }

            var runProperties = run.Element(drawing + "rPr");
            var fragments = text.Value.Split(@"`n", StringSplitOptions.None);
            var replacements = new List<XElement>();
            for (var i = 0; i < fragments.Length; i++)
            {
                if (fragments[i].Length > 0)
                {
                    var replacementRun = new XElement(drawing + "r");
                    if (runProperties is not null)
                    {
                        replacementRun.Add(new XElement(runProperties));
                    }

                    replacementRun.Add(new XElement(drawing + "t", fragments[i]));
                    replacements.Add(replacementRun);
                }

                if (i < fragments.Length - 1)
                {
                    var lineBreak = new XElement(drawing + "br");
                    if (runProperties is not null)
                    {
                        lineBreak.Add(new XElement(drawing + "rPr", runProperties.Attributes(), runProperties.Elements()));
                    }

                    replacements.Add(lineBreak);
                }
            }

            run.ReplaceWith(replacements);
            changed = true;
        }

        if (changed)
        {
            fixedSlides++;
        }

        document.Save(targetStream);
    }
}

Console.WriteLine($"Fixed line breaks in {fixedSlides} slide(s).");
return 0;
