(ns electric-starter-app.routes.two-clocks.page
  (:require [hyperfiddle.electric3 :as e]
            [electric-starter-app.two-clocks :refer [TwoClocks]]))

(e/defn Page [] (TwoClocks))
