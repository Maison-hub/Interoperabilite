<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" encoding="UTF-8" />

    <!-- Template principal -->
    <xsl:template match="/">
        <xsl:apply-templates select="//echeance[position() &lt;= 25]" />
    </xsl:template>

    <!-- Template pour chaque échéance -->
    <xsl:template match="echeance">
        <div class="echeance">
            <div class="header">
                <xsl:variable name="timestamp" select="@timestamp" />
                <span class="hour">
                    <xsl:value-of select="concat(substring($timestamp, 12, 2), 'h ')" />
                </span>
                <span class="date">
                    <xsl:value-of select="concat(substring($timestamp, 9, 2), '/', substring($timestamp, 6, 2), '/', substring($timestamp, 1, 4))" />
                </span>
            </div>
            <div class="info">
                <div class="temperature">
                    <xsl:apply-templates select="temperature" />
                </div>
                <div class="pluie">
                    <xsl:apply-templates select="pluie" />
                </div>
                <div class="risque_neige">
                    <xsl:apply-templates select="risque_neige" />
                </div>
                <div class="vent_moyen">
                    <xsl:apply-templates select="vent_moyen" />
                </div>
            </div>
        </div>
    </xsl:template>

    <!-- Template pour la température -->
    <xsl:template match="temperature">
        <xsl:choose>
            <xsl:when test="level - 273.15 &lt; 8">
                <span class="bad">❄️ Froid</span>
            </xsl:when>
            <xsl:when test="level - 273.15 &gt; 20">
                <span>🔥 Chaud</span>
            </xsl:when>
            <xsl:otherwise>
                <span>🌡️Tempéré</span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Template pour la pluie -->
    <xsl:template match="pluie">
        <xsl:choose>
            <xsl:when test=". &gt; 0">
                <span class="bad">🌧️ Pluie</span>
            </xsl:when>
            <xsl:otherwise>
                <span>☀️ Pas de pluie</span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Template pour le risque de neige -->
    <xsl:template match="risque_neige">
        <xsl:choose>
            <xsl:when test=". &gt; 0">
                <span class="bad">❄️ Neige</span>
            </xsl:when>
            <xsl:otherwise>
                <span>☀️ Pas de neige</span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Template pour le vent -->
    <xsl:template match="vent_moyen">
        <xsl:choose>
            <xsl:when test="level/@val &gt; 20">
                <span class="bad">💨 Vent fort</span>
            </xsl:when>
            <xsl:otherwise>
                <span>🍃 Vent léger</span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>