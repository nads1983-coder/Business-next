"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { ResourceGuide } from "@/content/resources";
import { resourcePath } from "@/content/resources";
import type { ComparisonResource } from "@/content/authority";
import { comparisonPath } from "@/content/authority";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ResourceExplorer({
  guides,
  comparisons
}: {
  guides: readonly ResourceGuide[];
  comparisons: readonly ComparisonResource[];
}) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");

  const topics = ["all", "Companies House", "HMRC", "VAT", "PAYE", "Self Assessment", "Comparison"];
  const items = useMemo(() => {
    const normalised = query.trim().toLowerCase();
    const guideItems = guides.map((guide) => ({
      key: guide.slug,
      type: "Guide",
      topic: inferTopic(guide.title),
      title: guide.shortTitle,
      description: guide.description,
      href: resourcePath(guide.slug)
    }));
    const comparisonItems = comparisons.map((comparison) => ({
      key: comparison.slug,
      type: "Comparison",
      topic: "Comparison",
      title: comparison.shortTitle,
      description: comparison.description,
      href: comparisonPath(comparison.slug)
    }));

    return [...guideItems, ...comparisonItems].filter((item) => {
      const matchesTopic = topic === "all" || item.topic === topic || item.type === topic;
      const matchesQuery =
        !normalised ||
        `${item.title} ${item.description} ${item.topic}`.toLowerCase().includes(normalised);
      return matchesTopic && matchesQuery;
    });
  }, [comparisons, guides, query, topic]);

  return (
    <section className="space-y-5" aria-labelledby="resource-search-title">
      <div>
        <h2 id="resource-search-title" className="text-2xl font-semibold tracking-normal">
          Find the next guide
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Search by topic, deadline, filing body or comparison. Results are limited to Business Sorted resources that link back to official sources.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative block">
          <span className="sr-only">Search resources</span>
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search VAT, accounts, payroll..."
            className="pl-9"
          />
        </label>
        <label>
          <span className="sr-only">Filter topic</span>
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {topics.map((topicName) => (
              <option key={topicName} value={topicName}>
                {topicName === "all" ? "All topics" : topicName}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={`${item.type}-${item.key}`}>
            <CardHeader>
              <CardTitle className="text-lg">
                <Link href={item.href} className="hover:text-primary">
                  {item.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-medium uppercase tracking-normal text-primary">{item.type} · {item.topic}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function inferTopic(title: string) {
  if (/VAT/i.test(title)) return "VAT";
  if (/PAYE/i.test(title)) return "PAYE";
  if (/Self Assessment/i.test(title)) return "Self Assessment";
  if (/Companies House|accounts|confirmation|dormant|company/i.test(title)) return "Companies House";
  return "HMRC";
}
