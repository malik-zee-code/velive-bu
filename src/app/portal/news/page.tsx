"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { newsService, News, NewsType, NewsPriority } from "@/lib/services";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Megaphone, Clock } from "lucide-react";
import { format } from "date-fns";

const NewsPage = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsService.getActiveNews(1, 50); // Get more news items
      setNews(response.data);
    } catch (err) {
      console.error("Failed to fetch news:", err);
      toast({ title: "Error", description: "Failed to load news", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const getTypeIcon = (type: NewsType) => {
    switch (type) {
      case NewsType.ALERT:
        return <AlertTriangle className="h-5 w-5" />;
      case NewsType.ANNOUNCEMENT:
        return <Megaphone className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getTypeBadge = (type: NewsType) => {
    const typeConfig = {
      [NewsType.NEWS]: { label: "News", className: "bg-blue-100 text-blue-800" },
      [NewsType.ALERT]: { label: "Alert", className: "bg-red-100 text-red-800" },
      [NewsType.ANNOUNCEMENT]: {
        label: "Announcement",
        className: "bg-purple-100 text-purple-800",
      },
    };

    const config = typeConfig[type];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: NewsPriority) => {
    const priorityConfig = {
      [NewsPriority.LOW]: { label: "Low", className: "bg-gray-100 text-gray-800" },
      [NewsPriority.MEDIUM]: { label: "Medium", className: "bg-yellow-100 text-yellow-800" },
      [NewsPriority.HIGH]: { label: "High", className: "bg-orange-100 text-orange-800" },
      [NewsPriority.URGENT]: { label: "Urgent", className: "bg-red-100 text-red-800" },
    };

    const config = priorityConfig[priority];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getCardBorderClass = (priority: NewsPriority) => {
    switch (priority) {
      case NewsPriority.URGENT:
        return "border-l-4 border-l-red-500";
      case NewsPriority.HIGH:
        return "border-l-4 border-l-orange-500";
      case NewsPriority.MEDIUM:
        return "border-l-4 border-l-yellow-500";
      default:
        return "border-l-4 border-l-gray-300";
    }
  };

  return (
    <div className="p-4 md:p-0">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Bell className="h-6 w-6" />
            News & Alerts
          </CardTitle>
          <CardDescription>Stay updated with the latest news and announcements</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading news...</p>
          ) : news.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No news or alerts at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <Card key={item.id || item._id} className={`${getCardBorderClass(item.priority)}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">{getTypeIcon(item.type)}</div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {getTypeBadge(item.type)}
                            {getPriorityBadge(item.priority)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap mb-4">{item.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(item.createdAt!), 'dd-MMM-yyyy')}
                      </div>
                      {item.expiresAt && (
                        <div className="flex items-center gap-1">
                          <span>Expires:</span>
                          {format(new Date(item.expiresAt), 'dd-MMM-yyyy')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsPage;
