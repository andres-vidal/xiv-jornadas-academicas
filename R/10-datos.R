# Datos comunes: trayectoria estudiantil (UCI 697, Realinho et al. 2021)
suppressMessages(library(dplyr))
# UCI 697 (Realinho et al. 2021). No se versiona: bajarlo a datos/uci697.csv
# o apuntar la variable de entorno UCI697 al archivo.
RUTA <- Sys.getenv("UCI697", "datos/uci697.csv")
VARS <- c(insc1="Curricular units 1st sem (enrolled)", apro1="Curricular units 1st sem (approved)",
          nota1="Curricular units 1st sem (grade)",    eval1="Curricular units 1st sem (evaluations)",
          insc2="Curricular units 2nd sem (enrolled)", apro2="Curricular units 2nd sem (approved)",
          nota2="Curricular units 2nd sem (grade)",    eval2="Curricular units 2nd sem (evaluations)",
          ingreso="Admission grade", edad="Age at enrollment", previa="Previous qualification (grade)")
cargar <- function() {
  d <- read.csv(RUTA, sep=";", check.names=FALSE, fileEncoding="UTF-8-BOM")
  names(d) <- trimws(names(d))
  df <- d[, VARS]; names(df) <- names(VARS); df$clase <- d$Target
  df |> filter(clase %in% c("Dropout","Graduate")) |>
    mutate(clase = factor(clase, c("Dropout","Graduate"), c("Abandona","Egresa")))
}
## Paleta de las XIV Jornadas Académicas (variables CSS del sitio de FCEA).
## Para datos usamos naranja + azul pizarra: mantienen contraste con deuteranopía
## (2,8:1). Amarillo y celeste son demasiado claros para puntos y quedan para el cromo.
JJAA <- c(naranja  = "#e8662e", azul     = "#3b5072",
          amarillo = "#f8ae20", celeste  = "#9bcad8",
          coral    = "#ea504c", tinta    = "#222222",
          fondo    = "#f7f7f7", papel    = "#ffffff")
COL <- c(Abandona = JJAA[["naranja"]], Egresa = JJAA[["azul"]])
## La tipografía del póster. Viene con macOS y tiene todos los glifos que usamos:
## subíndices, el punto medio, el menos "−" y "≥". Cambiando esta línea cambian las figuras.
FUENTE <- "PT Sans"
tema <- function(base = 22) {
  ggplot2::theme_minimal(base_size = base, base_family = FUENTE) +
  ggplot2::theme(
    panel.grid.minor = ggplot2::element_blank(),
    panel.grid.major = ggplot2::element_line(colour = "grey88", linewidth = .3),
    plot.title  = ggplot2::element_text(face = "bold", size = base * 1.15),
    strip.text  = ggplot2::element_text(face = "bold", size = base * 1.05),
    legend.position = "bottom", legend.title = ggplot2::element_blank(),
    axis.title  = ggplot2::element_text(size = base * .95))
}
