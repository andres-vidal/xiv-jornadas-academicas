# QR de la app, en SVG para la web y en PNG para pegar en el póster.
#
# Sin zona de silencio y sin fondo: sólo los módulos oscuros, sobre transparente.
# El aire alrededor lo tiene que poner la maqueta. La norma pide cuatro módulos
# libres a cada lado, así que hay que dejarle margen y apoyarlo sobre un fondo
# claro y liso, o no lo lee ningún lector.
library(qrcode)
url <- "https://andres-vidal.github.io/xiv-jornadas-academicas/"
qr <- qr_code(url, ecl = "M")
m <- as.matrix(qr); n <- nrow(m)
TINTA <- c(0x14, 0x16, 0x1C) / 255       # la tinta del póster, #14161C
cat("módulos:", n, "x", n, "\n")

# SVG nítido: un rect por módulo oscuro, sin antialias ni resolución fija
rects <- c()
for (i in seq_len(n)) for (j in seq_len(n)) if (m[i, j] == 1)
  rects <- c(rects, sprintf('<rect x="%d" y="%d" width="1" height="1"/>', j-1, i-1))
svg <- sprintf('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" shape-rendering="crispEdges"><g fill="#14161C">%s</g></svg>',
               n, n, paste(rects, collapse=""))
writeLines(svg, "assets/qr-app.svg")

# PNG para el .pptx: cada módulo ocupa un número entero de píxeles, así que los
# bordes caen justo y no hay medio píxel gris en el medio de un módulo. Va en
# RGBA para que el fondo quede transparente y la tinta conserve su color.
ESC <- 25                                # 39 módulos × 25 = 975 px
capa <- function(v) kronecker(matrix(v, n, n), matrix(1, ESC, ESC))
rgba <- array(0, dim = c(n * ESC, n * ESC, 4))
for (c in 1:3) rgba[, , c] <- capa(TINTA[c])
rgba[, , 4] <- kronecker(m, matrix(1, ESC, ESC))   # opaco sólo en los módulos
png::writePNG(rgba, "assets/qr-app.png")

cat("svg:", file.size("assets/qr-app.svg"), "bytes ·",
    "png:", n * ESC, "px,", file.size("assets/qr-app.png"), "bytes\n")
