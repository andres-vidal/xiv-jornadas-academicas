suppressMessages({library(dplyr); library(ggplot2)})
source("R/10-datos.R"); set.seed(2026)
b <- cargar()[, c("insc1","apro1","clase")]
X <- as.matrix(b[, c("insc1","apro1")]); y <- b$clase   # espacio original, no estandarizado

# indice LDA para una direccion 1D: I = 1 - (a'Wa)/(a'Ta)
W <- Reduce(`+`, lapply(levels(y), function(g){ Z <- scale(X[y==g,,drop=FALSE], scale=FALSE); t(Z)%*%Z }))
Tm <- { Z <- scale(X, scale=FALSE); t(Z)%*%Z }
indice <- function(th){ a <- c(cos(th), sin(th)); 1 - as.numeric(t(a)%*%W%*%a)/as.numeric(t(a)%*%Tm%*%a) }

th <- seq(0, pi, length.out = 721); I <- sapply(th, indice)
opt <- th[which.max(I)]
cat(sprintf("optimo: %.1f grados, I=%.3f\n", opt*180/pi, max(I)))

# panel de direcciones: la optima + otras
sel <- c(opt, opt + pi/5, opt + pi/3, opt + pi/2)
sel <- sort(sel[order(-sapply(sel, indice))])
sel <- sel[order(-sapply(sel, indice))]
dat <- bind_rows(lapply(seq_along(sel), function(i){
  a <- c(cos(sel[i]), sin(sel[i]))
  data.frame(z = as.numeric(X %*% a), clase = y,
             etq = sprintf("%d°  ·  I = %.2f", round((sel[i]*180/pi) %% 180), indice(sel[i])), orden = i)
}))
dat$etq <- factor(dat$etq, unique(dat$etq[order(dat$orden)]))

p <- ggplot(dat, aes(z, fill = clase)) +
  geom_density(alpha = .55, colour = "white", linewidth = .6, adjust = 1.7) +
  facet_wrap(~etq, nrow = 1, scales = "free") +
  scale_fill_manual(values = COL) +
  labs(x = "Posición de cada estudiante sobre la dirección elegida", y = NULL) +
  theme(axis.text.y = element_blank()) +
  tema(21) + theme(axis.text.y = element_blank(), axis.text.x = element_blank(),
                   panel.grid.major.x = element_blank())
ggsave("img/S2-indice-direcciones.png", p, width = 15, height = 4.8, dpi = 220, bg = "white", type = "cairo")

# curva del indice
cur <- data.frame(grados = th*180/pi, I = I)
p2 <- ggplot(cur, aes(grados, I)) +
  geom_line(linewidth = 1.4, colour = "grey30") +
  geom_point(data = data.frame(grados = opt*180/pi, I = max(I)), size = 6, colour = "#E1701A") +
  annotate("text", x = opt*180/pi + 6, y = max(I), hjust = 0, vjust = .3,
           label = sprintf("mejor dirección\n%d°  ·  I = %.2f", round(opt*180/pi), max(I)), size = 6.5) +
  labs(x = "Ángulo de la dirección (grados)", y = "Índice de proyección") +
  coord_cartesian(xlim = c(0,180)) + scale_x_continuous(breaks = seq(0,180,45)) + tema(21)
ggsave("img/S3-curva-indice.png", p2, width = 8.5, height = 5, dpi = 220, bg = "white", type = "cairo")
cat("guardado\n")
