import { ManageAccountsSharp } from "@mui/icons-material";

export class Router {
    callback: (string) => void;
    constructor(callback: (string) => void) {
      this.callback = callback;
    }
    navigate(that: Router, path: string) {
      window.history.pushState({}, "", path);
      that.callback(path);
    }
    getPath() {
      return window.location.pathname;
    }
    matchParams(routePath: string) {
      const match = this.getPath().match(routePath.replaceAll("/", "\/").replaceAll(/\:\w+/g, (s) => "(?<"+s.substring(1)+">[^\/]+)"))
      return match?.groups!;
    }
  }