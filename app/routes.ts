import {
  type RouteConfig,
  route,
  layout,
  index,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  // صفحه روم با پارامتر داینامیک code
  route("room/:code", "./routes/room.tsx"),
  // (اختیاری) صفحه 404 برای مسیرهای پیدا نشده
  route("*", "./routes/not-found.tsx"),
] satisfies RouteConfig;
