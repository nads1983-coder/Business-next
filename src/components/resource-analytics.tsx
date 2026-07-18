"use client";

import Link from "next/link";
import React from "react";
import { useEffect, useRef } from "react";
import {
  getResourceClickEventName,
  getResourceDestinationType,
  getSourceDomain,
  type ResourceAnalyticsEventName,
  type ResourceAnalyticsProps
} from "@/lib/resource-analytics";

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: ResourceAnalyticsProps }) => void;
  }
}

function trackResourceEvent(eventName: ResourceAnalyticsEventName, props?: ResourceAnalyticsProps) {
  if (typeof window === "undefined" || typeof window.plausible !== "function") return;
  window.plausible(eventName, { props });
}

export function ResourceViewTracker({
  eventName,
  eventKey,
  props
}: {
  eventName: ResourceAnalyticsEventName;
  eventKey: string;
  props?: ResourceAnalyticsProps;
}) {
  const trackedKey = useRef<string | null>(null);

  useEffect(() => {
    if (trackedKey.current === eventKey) return;
    trackedKey.current = eventKey;
    trackResourceEvent(eventName, props);
  }, [eventKey, eventName, props]);

  return null;
}

export const ResourceTrackedLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  eventName?: ResourceAnalyticsEventName;
  eventProps?: ResourceAnalyticsProps;
  children: React.ReactNode;
}>(function ResourceTrackedLink({
  href,
  eventName,
  eventProps,
  children,
  ...props
}, ref) {
  const resolvedEventName = eventName ?? getResourceClickEventName(href);
  const destinationType = getResourceDestinationType(href);
  const trackingProps = {
    ...eventProps,
    destination_type: eventProps?.destination_type ?? destinationType,
    source_domain: eventProps?.source_domain ?? (destinationType === "external_source" ? getSourceDomain(href) : undefined)
  };

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    trackResourceEvent(resolvedEventName, trackingProps);
    props.onClick?.(event);
  }

  if (href.startsWith("http")) {
    return (
      <a {...props} href={href} onClick={handleClick} ref={ref}>
        {children}
      </a>
    );
  }

  return (
    <Link {...props} href={href} onClick={handleClick} ref={ref}>
      {children}
    </Link>
  );
});
